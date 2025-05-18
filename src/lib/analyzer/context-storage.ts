import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { clientDb } from '../firebase';
import { adminDb } from '../firebase-admin';
import { AnalyzerResult, ProjectContext } from './types';
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
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * Create a hash of the project path to use as a stable identifier
 */
function hashProjectPath(projectPath: string): string {
  return crypto.createHash('sha256').update(projectPath).digest('hex');
}

/**
 * Store analysis results in Firestore
 */
export async function storeProjectContext(
  userId: string,
  projectPath: string,
  result: AnalyzerResult
): Promise<string> {
  const projectHash = hashProjectPath(projectPath);

  // Check if we already have an entry for this project
  const existingContext = await getLatestProjectContext(userId, projectPath);

  if (existingContext) {
    // Increment version and update
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      updatedAt: Date.now(),
      version: existingContext.version + 1,
    };

    const contextRef = doc(clientDb, 'projectContexts', existingContext.id);
    await updateDoc(contextRef, contextData);
    return existingContext.id;
  } else {
    // Create new entry
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const docRef = await addDoc(
      collection(clientDb, 'projectContexts'),
      contextData
    );
    return docRef.id;
  }
}

/**
 * Get the latest context for a project
 */
export async function getLatestProjectContext(
  userId: string,
  projectPath: string
): Promise<StoredProjectContext | null> {
  const projectHash = hashProjectPath(projectPath);

  const contextQuery = query(
    collection(clientDb, 'projectContexts'),
    where('userId', '==', userId),
    where('projectHash', '==', projectHash),
    orderBy('version', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(contextQuery);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as StoredProjectContext;
}

/**
 * Get all projects analyzed by a user
 */
export async function getUserProjects(
  userId: string
): Promise<StoredProjectContext[]> {
  // First, get the latest version of each project hash
  const projectHashes = new Set<string>();
  const latestVersions = new Map<string, StoredProjectContext>();

  const contextQuery = query(
    collection(clientDb, 'projectContexts'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(contextQuery);

  for (const doc of snapshot.docs) {
    const data = doc.data() as Omit<StoredProjectContext, 'id'>;
    const hash = data.projectHash;

    if (!projectHashes.has(hash)) {
      projectHashes.add(hash);
      latestVersions.set(hash, {
        id: doc.id,
        ...data,
      } as StoredProjectContext);
    }
  }

  return Array.from(latestVersions.values());
}

/**
 * Delete a project context and all its versions
 */
export async function deleteProjectContext(
  userId: string,
  projectPath: string
): Promise<void> {
  const projectHash = hashProjectPath(projectPath);

  const contextQuery = query(
    collection(clientDb, 'projectContexts'),
    where('userId', '==', userId),
    where('projectHash', '==', projectHash)
  );

  const snapshot = await getDocs(contextQuery);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

/**
 * Admin function to get project context by ID
 * This is useful for API routes where the user ID might be coming from auth
 */
export async function getProjectContextById(
  contextId: string
): Promise<StoredProjectContext | null> {
  // Use admin SDK for server-side operations
  const docRef = adminDb.collection('projectContexts').doc(contextId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as StoredProjectContext;
}
