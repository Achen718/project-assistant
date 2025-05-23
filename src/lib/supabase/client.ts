import { createClient, SupabaseClient } from '@supabase/supabase-js';

// For Admin Client (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For Anonymous Client (Public Key)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL is not defined. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file.'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Supabase service role key is not defined. Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase anon key is not defined. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

/**
 * Supabase client instance authenticated with the service role key.
 * This client has admin privileges and bypasses RLS.
 * Use this for server-side operations only that require elevated permissions.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Supabase client instance authenticated with the public anonymous key.
 * This client is suitable for operations that respect RLS and are typically used on the client-side,
 * or for server-side operations where user-context RLS is intended to apply.
 */
export const supabaseAnon: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export interface VectorQueryResult {
  id: string; // Assuming UUID is returned as string
  project_id: string; // Assuming UUID is returned as string
  file_path: string;
  chunk_text: string;
  similarity: number;
  // Add other fields if your SQL function returns more
}

export async function findSimilarDocumentChunks(
  queryEmbedding: number[],
  matchThreshold: number,
  matchCount: number,
  projectId: string // Added projectId
): Promise<{
  data: VectorQueryResult[] | null;
  error: Error | null;
}> {
  if (!supabaseAdmin) {
    return {
      data: null,
      error: new Error('Supabase admin client not initialized.'),
    };
  }
  if (!queryEmbedding || queryEmbedding.length === 0) {
    return { data: null, error: new Error('Query embedding is empty.') };
  }
  if (!projectId) {
    return { data: null, error: new Error('Project ID is required.') };
  }

  try {
    // Ensure the embedding is formatted as a string PostgreSQL expects for a vector.
    // PostgreSQL vector format is '[f1,f2,f3,...]'
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: embeddingString, // Pass as string
      match_threshold: matchThreshold,
      match_count: matchCount,
      target_project_id: projectId, // Pass projectId here
    });

    if (error) {
      console.error('Supabase RPC error in findSimilarDocumentChunks:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as VectorQueryResult[], error: null };
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('Exception in findSimilarDocumentChunks:', err.message);
    return { data: null, error: err };
  }
}
