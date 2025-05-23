export interface FileChunk {
  projectId: string; // This will be UUID
  filePath: string;
  startLine: number; // Line number where the chunk begins
  endLine: number; // Line number where the chunk ends
  content: string;
  chunkIndex: number; // Index of the chunk within the file
}

export interface EmbeddedChunk extends FileChunk {
  embedding: number[];
  userId: string; // UUID, to be associated with the chunk
  // metadata can be added if you add a JSONB column to document_chunks later
}

// Represents the structure of how embeddings will be stored in Supabase
// Aligned with your `document_chunks` table
export interface SupabaseEmbeddingRow {
  id?: string; // UUID, primary key (optional on insert if DB generates it)
  project_id: string; // UUID, Foreign key to projects table
  user_id: string; // UUID, Foreign key to auth.users table
  file_path: string;
  chunk_text: string;
  embedding: number[]; // pgvector type in Supabase
  start_char_offset?: number | null; // Corresponds to startLine from FileChunk, or actual char offset
  end_char_offset?: number | null; // Corresponds to endLine from FileChunk, or actual char offset
  chunk_sequence_number?: number | null; // Corresponds to chunkIndex from FileChunk
  created_at?: string; // Timestamp (optional on insert if DB generates it)
}

export interface IndexingResult {
  projectId: string;
  userId: string;
  totalFilesProcessed: number;
  totalChunksCreated: number;
  totalEmbeddingsStored: number;
  errors: { filePath: string; message: string }[];
}

// Updated to reflect fields from document_chunks and similarity score
export interface SearchResult {
  id: string; // Chunk ID
  project_id: string;
  user_id: string;
  file_path: string;
  chunk_text: string;
  start_char_offset?: number | null;
  end_char_offset?: number | null;
  chunk_sequence_number?: number | null;
  similarity: number;
  created_at: string;
  // embedding could be returned by the RPC if needed
}
