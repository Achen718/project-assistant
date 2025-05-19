import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  LangChainLanguageCode,
  detectLanguageFromExtension,
  splitCodeIntoChunks,
  SplitDocument,
} from '@/lib/ai/text-splitter';
import { generateEmbeddings } from '@/lib/ai/embedding-utils';
import { addDocumentChunks, DocumentChunkData } from '@/lib/supabase/client';

// Configuration for indexing
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for individual files
const ALLOWED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.md',
  '.mdx',
  '.json',
  '.py',
  '.html',
  '.css',
];
const IGNORED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'out',
  'public/generated',
];
const IGNORED_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
const PROJECT_ROOT = process.cwd(); // Assumes the API is run from the project root

// --- Helper function to recursively find files ---
async function getProjectFiles(
  dir: string,
  baseDir: string = dir,
  allFiles: string[] = []
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (
      IGNORED_DIRS.some((ignoredDir) => relativePath.startsWith(ignoredDir)) ||
      IGNORED_FILES.includes(entry.name)
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      await getProjectFiles(fullPath, baseDir, allFiles);
    } else if (
      entry.isFile() &&
      ALLOWED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
    ) {
      try {
        const stats = await fs.stat(fullPath);
        if (stats.size > MAX_FILE_SIZE_BYTES) {
          console.warn(
            `Skipping large file (>${
              MAX_FILE_SIZE_BYTES / (1024 * 1024)
            }MB): ${relativePath}`
          );
          continue;
        }
        allFiles.push(relativePath);
      } catch (statError) {
        console.error(
          `Error getting stats for file ${relativePath}:`,
          statError
        );
      }
    }
  }
  return allFiles;
}

// Constants for batching
const EMBEDDING_BATCH_SIZE = 50; // Number of texts to embed in one API call
const DB_BATCH_SIZE = 100; // Number of chunks to insert into DB in one transaction

export async function POST() {
  console.log('Project indexing process started...');
  let filesProcessed = 0;
  let totalChunksGenerated = 0;
  let errorsEncountered = 0;
  const allChunksToEmbed: {
    filePath: string;
    pageContent: string;
    language: LangChainLanguageCode;
  }[] = [];

  try {
    const projectFiles = await getProjectFiles(PROJECT_ROOT);
    console.log(`Found ${projectFiles.length} files to process.`);

    for (const relativeFilePath of projectFiles) {
      const absoluteFilePath = path.join(PROJECT_ROOT, relativeFilePath);
      try {
        const fileContent = await fs.readFile(absoluteFilePath, 'utf-8');
        const language = detectLanguageFromExtension(relativeFilePath);

        if (!language) {
          console.warn(
            `Skipping file with unknown language: ${relativeFilePath}`
          );
          errorsEncountered++;
          continue;
        }

        const splitDocuments: SplitDocument[] = await splitCodeIntoChunks(
          fileContent,
          relativeFilePath,
          language
        );

        splitDocuments.forEach((doc) => {
          allChunksToEmbed.push({
            filePath: doc.metadata.filePath,
            pageContent: doc.pageContent,
            language: doc.metadata.language,
          });
        });

        totalChunksGenerated += splitDocuments.length;
        filesProcessed++;
        if (filesProcessed % 10 === 0) {
          console.log(
            `Processed ${filesProcessed}/${projectFiles.length} files...`
          );
        }
      } catch (fileError: unknown) {
        const message =
          fileError instanceof Error
            ? fileError.message
            : 'Unknown error processing file';
        console.error(`Error processing file ${relativeFilePath}: ${message}`);
        errorsEncountered++;
      }
    }
    console.log(
      `All files read and chunked. Total chunks to embed: ${allChunksToEmbed.length}`
    );

    // --- Batch Embeddings and DB Storage ---
    const supabaseChunks: DocumentChunkData[] = [];
    for (let i = 0; i < allChunksToEmbed.length; i += EMBEDDING_BATCH_SIZE) {
      const batchToEmbed = allChunksToEmbed.slice(i, i + EMBEDDING_BATCH_SIZE);
      const textsToEmbed = batchToEmbed.map((chunk) => chunk.pageContent);

      console.log(
        `Generating embeddings for batch ${
          i / EMBEDDING_BATCH_SIZE + 1
        }/${Math.ceil(allChunksToEmbed.length / EMBEDDING_BATCH_SIZE)}...`
      );
      const embeddings = await generateEmbeddings(textsToEmbed);

      if (embeddings && embeddings.length === batchToEmbed.length) {
        batchToEmbed.forEach((chunk, index) => {
          supabaseChunks.push({
            project_id: 'current-project', // Placeholder, replace with actual project ID if managing multiple
            file_path: chunk.filePath,
            chunk_text: chunk.pageContent,
            embedding: embeddings[index],
          });
        });
      } else {
        console.error(
          `Error generating embeddings for a batch, or mismatch in count. Found ${embeddings?.length} for ${batchToEmbed.length} texts. Skipping batch.`
        );
        errorsEncountered += batchToEmbed.length; // Count these as errors
      }
    }
    console.log(
      `All embeddings generated. Total Supabase chunks to store: ${supabaseChunks.length}`
    );

    for (let i = 0; i < supabaseChunks.length; i += DB_BATCH_SIZE) {
      const dbBatch = supabaseChunks.slice(i, i + DB_BATCH_SIZE);
      console.log(
        `Storing DB batch ${i / DB_BATCH_SIZE + 1}/${Math.ceil(
          supabaseChunks.length / DB_BATCH_SIZE
        )}...`
      );
      const { error: dbError } = await addDocumentChunks(dbBatch);
      if (dbError) {
        console.error('Error storing batch to Supabase:', dbError.message);
        errorsEncountered += dbBatch.length; // Count these as errors
      }
    }

    console.log(
      `Indexing complete. Files processed: ${filesProcessed}, Chunks created: ${totalChunksGenerated}, Errors: ${errorsEncountered}`
    );
    return NextResponse.json({
      message: 'Project indexing completed.',
      filesFound: projectFiles.length,
      filesProcessed,
      chunksCreated: totalChunksGenerated,
      errorsEncountered,
    });
  } catch (error: unknown) {
    console.error('Critical error during project indexing:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown critical error occurred';
    return NextResponse.json(
      { message: 'Project indexing failed critically.', error: errorMessage },
      { status: 500 }
    );
  }
}
