import { processProjectFiles } from './file-processor';
import { generateEmbeddings } from '../ai/embedding-utils';
import {
  storeEmbeddings,
  EMBEDDINGS_TABLE_NAME,
} from './supabase-embedding-service';
import { FileChunk, EmbeddedChunk, IndexingResult } from './types';
import { supabaseAdmin } from '../supabase/client'; // For admin operations
// import { v4 as uuidv4 } from 'uuid'; // Not directly used here, but good for other potential ID generations

/**
 * Orchestrates the project indexing pipeline:
 * 1. Processes project files into chunks.
 * 2. Generates embeddings for these chunks.
 * 3. Stores the embedded chunks in Supabase.
 *
 * @param projectPath Absolute path to the project directory.
 * @param projectId A unique identifier for the project.
 * @param userId A unique identifier for the user.
 * @param ignorePatterns Optional array of glob patterns to ignore during file processing.
 * @returns A summary of the indexing process.
 */
export async function startIndexingPipeline(
  projectPath: string,
  projectId: string,
  userId: string,
  ignorePatterns?: string[]
): Promise<IndexingResult> {
  console.log(
    `[startIndexingPipeline] User: ${userId}, Project: ${projectId}, Path: ${projectPath}`
  );
  const startTime = Date.now();

  const result: IndexingResult = {
    projectId,
    userId,
    totalFilesProcessed: 0,
    totalChunksCreated: 0,
    totalEmbeddingsStored: 0,
    errors: [],
  };

  try {
    // 1. Process project files into chunks
    console.log(`[startIndexingPipeline] Step 1: Processing project files...`);
    const fileChunks: FileChunk[] = await processProjectFiles(
      projectPath,
      projectId,
      ignorePatterns
    );
    result.totalChunksCreated = fileChunks.length;
    const uniqueFiles = new Set(fileChunks.map((chunk) => chunk.filePath));
    result.totalFilesProcessed = uniqueFiles.size;

    if (fileChunks.length === 0) {
      console.log('[startIndexingPipeline] No file chunks to process.');
      return result;
    }
    console.log(
      `[startIndexingPipeline] Generated ${result.totalChunksCreated} chunks from ${result.totalFilesProcessed} files.`
    );

    // 2. Generate embeddings for these chunks
    console.log(`[startIndexingPipeline] Step 2: Generating embeddings...`);
    const contentToEmbed = fileChunks.map((chunk) => chunk.content);
    const embeddings = await generateEmbeddings(contentToEmbed);

    if (!embeddings || embeddings.length !== fileChunks.length) {
      const errorMessage =
        'Failed to generate embeddings or mismatch in count.';
      console.error(`[startIndexingPipeline] ${errorMessage}`);
      result.errors.push({ filePath: 'multiple', message: errorMessage });
      return result;
    }
    console.log(
      `[startIndexingPipeline] Generated ${embeddings.length} embeddings.`
    );

    const embeddedChunks: EmbeddedChunk[] = fileChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
      userId: userId,
    }));

    // 3. Store the embedded chunks in Supabase
    console.log(`[startIndexingPipeline] Step 3: Storing embeddings...`);
    const { storedCount, errors: storageErrors } = await storeEmbeddings(
      embeddedChunks
    );
    result.totalEmbeddingsStored = storedCount;

    if (storageErrors.length > 0) {
      console.warn(
        '[startIndexingPipeline] Encountered errors during storage:',
        storageErrors
      );
      storageErrors.forEach((err) => {
        result.errors.push({
          filePath: err.item.filePath,
          message: `Storage error: ${err.error.message}`,
        });
      });
    }
    console.log(
      `[startIndexingPipeline] Stored ${result.totalEmbeddingsStored} embeddings.`
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during indexing pipeline';
    console.error(`[startIndexingPipeline] Critical error: ${message}`, error);
    result.errors.push({ filePath: 'pipeline_error', message });
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(
    `[startIndexingPipeline] Indexing completed for project ${projectId} (User: ${userId}) in ${duration.toFixed(
      2
    )}s.`
  );
  console.log(
    `[startIndexingPipeline] Summary: Files: ${result.totalFilesProcessed}, Chunks: ${result.totalChunksCreated}, Stored: ${result.totalEmbeddingsStored}, Errors: ${result.errors.length}`
  );

  return result;
}

/**
 * Clears all embeddings for a given project ID from Supabase using admin client.
 * @param projectId The ID of the project whose embeddings are to be cleared.
 * @param userId The ID of the user whose embeddings are to be cleared.
 * @returns An object indicating success or failure, with an error message if applicable.
 */
export async function clearProjectEmbeddings(
  projectId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  console.log(
    `[clearProjectEmbeddings] Attempting to clear embeddings for project ${projectId} by user ${userId}`
  );
  try {
    const { error } = await supabaseAdmin
      .from(EMBEDDINGS_TABLE_NAME)
      .delete()
      .match({ project_id: projectId, user_id: userId });

    if (error) {
      console.error(
        `Error deleting embeddings for project ${projectId} (User: ${userId}):`,
        error
      );
      return { success: false, error: error.message };
    }
    console.log(
      `[clearProjectEmbeddings] Successfully cleared embeddings for project ${projectId} (User: ${userId})`
    );
    return { success: true };
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : 'Unknown error during clearProjectEmbeddings';
    console.error(
      `[clearProjectEmbeddings] Exception for User ${userId}, Project ${projectId}: ${message}`,
      e
    );
    return { success: false, error: message };
  }
}
