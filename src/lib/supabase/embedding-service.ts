import { supabaseAdmin } from './client';

/**
 * Represents the structure of a document chunk to be stored in Supabase.
 * The 'embedding' is expected as an array of numbers by the Supabase client.
 */
export interface DocumentChunkData {
  project_id: string;
  file_path: string;
  chunk_text: string;
  embedding: number[];
}

/**
 * Represents a document chunk retrieved from Supabase, including its ID and timestamp.
 */
export interface DocumentChunk extends DocumentChunkData {
  id: string;
  created_at: string;
}

/**
 * Represents the result of a vector similarity search.
 */
export interface VectorQueryResult {
  id: string;
  project_id?: string | null;
  file_path: string;
  chunk_text: string;
  similarity: number;
}

/**
 * Adds multiple document chunks to the Supabase 'document_chunks' table.
 *
 * @param chunks An array of document chunk data to insert.
 * @returns An object containing the inserted data or an error.
 */
export async function addDocumentChunks(
  chunks: DocumentChunkData[]
): Promise<{ data: DocumentChunk[] | null; error: Error | null }> {
  if (!chunks || chunks.length === 0) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('document_chunks')
      .insert(chunks)
      .select();

    if (error) {
      console.error('Error adding document chunks to Supabase:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as DocumentChunk[], error: null };
  } catch (e: unknown) {
    console.error('Unexpected error in addDocumentChunks:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred';
    return { data: null, error: new Error(errorMessage) };
  }
}

/**
 * Finds document chunks in Supabase that are semantically similar to a given query vector.
 * This function calls the 'match_document_chunks' RPC (SQL function) in Supabase.
 *
 * @param queryEmbedding The vector representation of the user's query.
 * @param matchThreshold The minimum similarity score for a chunk to be considered a match (e.g., 0.7).
 * @param matchCount The maximum number of similar chunks to retrieve.
 * @param projectId The project ID to filter document chunks.
 * @returns An object containing an array of matching document chunks or an error.
 */
export async function findSimilarDocumentChunks(
  queryEmbedding: number[],
  matchThreshold: number,
  matchCount: number,
  projectId: string
): Promise<{ data: VectorQueryResult[] | null; error: Error | null }> {
  if (!queryEmbedding || queryEmbedding.length === 0) {
    return { data: [], error: new Error('Query embedding cannot be empty.') };
  }
  if (matchThreshold < 0 || matchThreshold > 1) {
    return {
      data: [],
      error: new Error('Match threshold must be between 0 and 1.'),
    };
  }
  if (matchCount <= 0) {
    return {
      data: [],
      error: new Error('Match count must be greater than 0.'),
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      target_project_id: projectId,
    });

    if (error) {
      console.error(
        'Error finding similar document chunks in Supabase:',
        error
      );
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as VectorQueryResult[], error: null };
  } catch (e: unknown) {
    console.error('Unexpected error in findSimilarDocumentChunks:', e);
    const errorMessage =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during similarity search';
    return { data: null, error: new Error(errorMessage) };
  }
}
