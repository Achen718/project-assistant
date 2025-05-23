import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { generateEmbeddings } from './embedding-utils';

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

// TODO: Implement .gitignore parsing and more sophisticated include/exclude rules
const DEFAULT_EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.lock',
  '**/*.log',
  // Add more common patterns for compiled files, logs, etc.
];

export interface FileChunk {
  filePath: string;
  fullPath: string;
  contentChunk: string;
  embedding: number[];
  startPosition: number;
  endPosition: number;
  chunkNumber: number;
}

/**
 * Retrieves a list of file paths in a directory, respecting exclude patterns.
 * @param projectPath The root path of the project.
 * @param excludePatterns Optional array of glob patterns to exclude.
 * @returns A promise that resolves to an array of file paths.
 */
async function getProjectFilePaths(
  projectPath: string,
  excludePatterns: string[] = DEFAULT_EXCLUDE_PATTERNS
): Promise<string[]> {
  try {
    const files = await glob('**/*', {
      cwd: projectPath,
      nodir: true, // Only files, not directories
      dot: true, // Include dotfiles (like .env, .eslintrc) but consider exclude patterns
      ignore: excludePatterns,
      absolute: false, // Return paths relative to cwd for easier handling
    });
    return files;
  } catch (error) {
    console.error(
      `[FileProcessorService] Error scanning project files in ${projectPath}:`,
      error
    );
    throw error;
  }
}

/**
 * Processes a single file: reads its content, splits it into chunks, and generates embeddings.
 * @param projectPath The root path of the project (for resolving full paths).
 * @param relativeFilePath The path to the file, relative to the projectPath.
 * @param splitter Instance of RecursiveCharacterTextSplitter.
 * @returns A promise that resolves to an array of FileChunk objects for the file.
 */
async function processFile(
  projectPath: string,
  relativeFilePath: string,
  splitter: RecursiveCharacterTextSplitter
): Promise<FileChunk[]> {
  const fullPath = path.join(projectPath, relativeFilePath);
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    if (!content.trim()) {
      // Skip empty or whitespace-only files
      return [];
    }

    const textChunks = await splitter.splitText(content);
    if (!textChunks || textChunks.length === 0) {
      return [];
    }

    const embeddings = await generateEmbeddings(textChunks);
    if (!embeddings || embeddings.length !== textChunks.length) {
      console.warn(
        `[FileProcessorService] Embedding generation mismatch for ${relativeFilePath}. Expected ${textChunks.length}, got ${embeddings?.length}. Skipping file.`
      );
      return []; // Or handle partial success if appropriate
    }

    const fileChunks: FileChunk[] = [];
    let currentPosition = 0;
    for (let i = 0; i < textChunks.length; i++) {
      const chunkContent = textChunks[i];
      const embedding = embeddings[i];
      if (!embedding) {
        console.warn(
          `[FileProcessorService] Skipping chunk ${
            i + 1
          } of ${relativeFilePath} due to missing embedding.`
        );
        currentPosition += chunkContent.length; // Approximating advancement
        if (i < textChunks.length - 1) currentPosition += DEFAULT_CHUNK_OVERLAP; // Approximation if overlap was to be removed
        continue;
      }

      const startPosition = content.indexOf(chunkContent, currentPosition);
      const endPosition = startPosition + chunkContent.length;

      fileChunks.push({
        filePath: relativeFilePath,
        fullPath: fullPath,
        contentChunk: chunkContent,
        embedding: embedding,
        startPosition: startPosition !== -1 ? startPosition : currentPosition, // Fallback if indexOf fails (e.g. due to splitting nuances)
        endPosition:
          startPosition !== -1
            ? endPosition
            : currentPosition + chunkContent.length, // Fallback
        chunkNumber: i + 1,
      });
      currentPosition = endPosition - DEFAULT_CHUNK_OVERLAP; // Adjust for next search, considering overlap
      if (currentPosition < 0) currentPosition = 0;
    }
    return fileChunks;
  } catch (error) {
    console.error(
      `[FileProcessorService] Error processing file ${fullPath}:`,
      error
    );
    return []; // Return empty array for this file on error, so batch processing can continue
  }
}

/**
 * Orchestrates the processing of all relevant files in a project directory.
 * @param projectPath The absolute path to the project directory.
 * @param chunkSize Optional chunk size for the text splitter.
 * @param chunkOverlap Optional chunk overlap for the text splitter.
 * @returns A promise that resolves to an array of all FileChunk objects for the project.
 */
export async function processProjectFiles(
  projectPath: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP
): Promise<FileChunk[]> {
  console.log(
    `[FileProcessorService] Starting to process project at: ${projectPath}`
  );
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    // Consider adding lengthFunction if needed, e.g. for token-based splitting
  });

  const allFileChunks: FileChunk[] = [];
  try {
    const filePaths = await getProjectFilePaths(projectPath);
    console.log(
      `[FileProcessorService] Found ${filePaths.length} files to process.`
    );

    for (const relativeFilePath of filePaths) {
      console.log(`[FileProcessorService] Processing: ${relativeFilePath}`);
      const chunks = await processFile(projectPath, relativeFilePath, splitter);
      allFileChunks.push(...chunks);
    }

    console.log(
      `[FileProcessorService] Finished processing. Total chunks created: ${allFileChunks.length}`
    );
    return allFileChunks;
  } catch (error) {
    console.error(
      `[FileProcessorService] Critical error during project processing for ${projectPath}:`,
      error
    );
    throw error; // Or return partial results: return allFileChunks;
  }
}
