import * as fs from 'fs/promises';
// import * as path from 'path'; // Not used currently
import { glob } from 'glob';
import { FileChunk } from './types';

const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  '.git/**',
  'dist/**',
  'out/**',
  '*.lock',
  '*.log',
  'package-lock.json',
  'yarn.lock',
  // Add more common patterns for compiled files, logs, etc.
  '*.DS_Store',
  '.env*',
  '*.env',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
  '__tests__/**',
  'coverage/**',
];

const MAX_CHUNK_SIZE = 500; // Max characters per chunk
const CHUNK_OVERLAP = 50; // Characters of overlap between chunks

/**
 * Reads a file and splits its content into chunks.
 * @param filePath Absolute path to the file.
 * @param projectId The ID of the project.
 * @returns An array of FileChunk objects or null if the file cannot be processed.
 */
async function readFileAndChunk(
  projectId: string,
  filePath: string
): Promise<FileChunk[] | null> {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    // Sanitize content: remove NUL characters
    content = content.replace(/\u0000/g, '');

    if (!content.trim()) {
      return [];
    }

    const chunks: FileChunk[] = [];
    let chunkIndex = 0;
    let start = 0;
    const lineOffset = 0; // To keep track of original line numbers, assuming simple chunking for now

    while (start < content.length) {
      const end = Math.min(start + MAX_CHUNK_SIZE, content.length);
      const chunkContent = content.substring(start, end);

      // Calculate start and end lines for the chunk
      const linesBeforeChunk =
        content.substring(0, start).split('\n').length - 1;
      const chunkLines = chunkContent.split('\n').length - 1;

      chunks.push({
        projectId,
        filePath,
        content: chunkContent,
        startLine: lineOffset + linesBeforeChunk + 1, // 1-indexed
        endLine: lineOffset + linesBeforeChunk + chunkLines + 1, // 1-indexed
        chunkIndex,
      });

      chunkIndex++;
      if (end === content.length) {
        break;
      }
      start += MAX_CHUNK_SIZE - CHUNK_OVERLAP;
      // If overlap is implemented in a way that affects line numbers, adjust lineOffset here
    }
    return chunks;
  } catch (error) {
    console.error(`Error reading or chunking file ${filePath}:`, error);
    return null;
  }
}

/**
 * Scans a project directory, filters files, and processes them into chunks.
 * @param projectPath Absolute path to the project directory.
 * @param projectId The ID of the project.
 * @param ignorePatterns Optional array of glob patterns to ignore.
 * @returns An array of FileChunk objects.
 */
export async function processProjectFiles(
  projectPath: string,
  projectId: string,
  ignorePatterns: string[] = DEFAULT_IGNORE_PATTERNS
): Promise<FileChunk[]> {
  const allFileChunks: FileChunk[] = [];
  const files = await glob('**/*', {
    cwd: projectPath,
    nodir: true,
    ignore: ignorePatterns,
    dot: true, // Include dotfiles not explicitly ignored
    absolute: true,
  });

  console.log(
    `[processProjectFiles] Found ${files.length} files to process for project ${projectId}.`
  );

  for (const file of files) {
    // Basic check for binary files, can be improved
    if (
      /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|otf|ico|pdf|zip|gz|mp3|mp4)$/i.test(
        file
      )
    ) {
      console.log(`[processProjectFiles] Skipping binary file: ${file}`);
      continue;
    }
    const chunks = await readFileAndChunk(projectId, file);
    if (chunks) {
      allFileChunks.push(...chunks); // Spread operator to add all elements from chunks
    }
  }
  console.log(
    `[processProjectFiles] Generated ${allFileChunks.length} chunks for project ${projectId}.`
  );
  return allFileChunks;
}
