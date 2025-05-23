import { supabaseAdmin, supabaseAnon as supabase } from '../supabase/client';
import {
  AnalyzerResult,
  AnalyzerProjectContext as ProjectContext,
} from './types';
import crypto from 'crypto';

/**
 * The context storage service provides persistence for project analysis results
 */
// Interface for stored context data
export interface StoredProjectContext {
  id: string;
  projectPath: string;
  projectHash: string;
  userId: string;
  context: ProjectContext;
  contextEmbedding?: number[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Placeholder for actual embedding generation
async function generateEmbeddingFromString(text: string): Promise<number[]> {
  // In a real scenario, this would call an embedding model/service.
  // For Supabase, you might use an Edge Function that hosts an embedding model.
  console.warn(
    'generateEmbeddingFromString: Using placeholder. Input text length:',
    text.length,
    'Replace with actual embedding generation.'
  );
  // Example: return a fixed-size array of zeros (e.g., for a 384-dimension model)
  return Array(384).fill(0);
}

/**
 * Create a hash of the project path to use as a stable identifier
 */
function hashProjectPath(projectPath: string): string {
  return crypto.createHash('sha256').update(projectPath).digest('hex');
}

/**
 * Store analysis results in Supabase
 */
export async function storeProjectContext(
  userId: string,
  projectPath: string,
  result: AnalyzerResult
): Promise<string> {
  const projectHash = hashProjectPath(projectPath);

  // Generate embedding for the context
  // Convert context object to a string representation for embedding.
  // This is a simplistic approach; you might want a more sophisticated way to represent the context as text.
  const contextText = JSON.stringify(result.context);
  const embedding = await generateEmbeddingFromString(contextText);

  const existingContext = await getLatestProjectContext(userId, projectPath);

  if (existingContext) {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      contextEmbedding: embedding,
      updatedAt: new Date().toISOString(),
      version: existingContext.version + 1,
    };

    const { data, error } = await supabase
      .from('projectContexts')
      .update(contextData)
      .eq('id', existingContext.id)
      .select('id')
      .single();

    if (error) {
      console.error('Error updating project context in Supabase:', error);
      throw error;
    }
    return data?.id || existingContext.id;
  } else {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      contextEmbedding: embedding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    const { data, error } = await supabase
      .from('projectContexts')
      .insert([contextData])
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting project context into Supabase:', error);
      throw error;
    }
    if (!data || !data.id) {
      throw new Error('Failed to insert project context or retrieve ID.');
    }
    return data.id;
  }
}

/**
 * Get the latest context for a project from Supabase
 */
export async function getLatestProjectContext(
  userId: string,
  projectPath: string
): Promise<StoredProjectContext | null> {
  const projectHash = hashProjectPath(projectPath);

  const { data, error } = await supabase
    .from('projectContexts')
    .select('*')
    .eq('userId', userId)
    .eq('projectHash', projectHash)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to return null if no row is found

  if (error) {
    console.error(
      'Error fetching latest project context from Supabase:',
      error
    );
    // It might be better to throw the error or handle it based on application needs
    return null;
  }

  return data as StoredProjectContext | null;
}

/**
 * Get all projects analyzed by a user from Supabase
 */
export async function getUserProjects(
  userId: string
): Promise<StoredProjectContext[]> {
  // const projectHashes = new Set<string>();
  // const latestVersions = new Map<string, StoredProjectContext>();
  //
  // const contextQuery = query(
  //   collection(clientDb, 'projectContexts'),
  //   where('userId', '==', userId),
  //   orderBy('updatedAt', 'desc')
  // );
  //
  // const snapshot = await getDocs(contextQuery);
  //
  // for (const doc of snapshot.docs) {
  //   const data = doc.data() as Omit<StoredProjectContext, 'id'>;
  //   const hash = data.projectHash;
  //
  //   if (!projectHashes.has(hash)) {
  //     projectHashes.add(hash);
  //     latestVersions.set(hash, {
  //       id: doc.id,
  //       ...data,
  //     } as StoredProjectContext);
  //   }
  // }
  //
  // return Array.from(latestVersions.values());

  // Fetch all projects by userId, then filter for the latest version of each projectHash client-side.
  // This is simpler than a complex SQL query for this specific logic if performance is not critical.
  const { data, error } = await supabase
    .from('projectContexts')
    .select('*')
    .eq('userId', userId)
    .order('projectHash', { ascending: true })
    .order('version', { ascending: false });

  if (error) {
    console.error('Error fetching user projects from Supabase:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Filter to get only the latest version of each project
  const latestProjects = new Map<string, StoredProjectContext>();
  for (const project of data as StoredProjectContext[]) {
    if (!latestProjects.has(project.projectHash)) {
      latestProjects.set(project.projectHash, project);
    }
  }

  return Array.from(latestProjects.values());
}

/**
 * Delete a project context and all its versions from Supabase
 */
export async function deleteProjectContext(
  userId: string,
  projectPath: string
): Promise<void> {
  const projectHash = hashProjectPath(projectPath);

  // const contextQuery = query(
  //   collection(clientDb, 'projectContexts'),
  //   where('userId', '==', userId),
  //   where('projectHash', '==', projectHash)
  // );
  //
  // const snapshot = await getDocs(contextQuery);
  //
  // const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  // await Promise.all(deletePromises);

  const { error } = await supabase
    .from('projectContexts')
    .delete()
    .eq('userId', userId)
    .eq('projectHash', projectHash);

  if (error) {
    console.error('Error deleting project context from Supabase:', error);
    throw error; // Or handle more gracefully depending on requirements
  }
}

/**
 * Admin function to get project context by ID from Supabase
 * This is useful for API routes where the user ID might be coming from auth
 * Note: Assumes RLS policies are set up in Supabase to allow this access,
 * or that the Supabase client is configured with service_role key for admin operations.
 */
export async function getProjectContextById(
  contextId: string
): Promise<StoredProjectContext | null> {
  // const docRef = adminDb.collection('projectContexts').doc(contextId);
  // const docSnap = await docRef.get();
  //
  // if (!docSnap.exists) {
  //   return null;
  // }
  //
  // return {
  //   id: docSnap.id,
  //   ...docSnap.data(),
  // } as StoredProjectContext;

  const { data, error } = await supabaseAdmin
    .from('projectContexts')
    .select('*')
    .eq('id', contextId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching project context by ID from Supabase:', error);
    throw error;
  }

  return data as StoredProjectContext | null;
}

export async function findSimilarProjectContexts(
  userId: string,
  embedding: number[],
  matchCount: number = 5,
  matchThreshold: number = 0.7 // Adjust as needed
): Promise<(StoredProjectContext & { similarity: number })[]> {
  if (!embedding || embedding.length === 0) {
    console.warn('findSimilarProjectContexts: Empty embedding provided.');
    return [];
  }

  const { data, error } = await supabase.rpc('match_project_contexts', {
    p_user_id: userId,
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('Error finding similar project contexts:', error);
    throw error;
  }

  return data || [];
}
