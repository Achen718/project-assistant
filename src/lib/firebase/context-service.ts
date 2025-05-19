import { adminDb } from '@/lib/firebase-admin';
import { ProjectContext, StoredAnalysisResult } from '@/lib/context/types';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Store project context analysis in Firestore
 */
export async function storeProjectContext(
  projectId: string,
  context: ProjectContext
): Promise<string> {
  const timestamp = Date.now();
  const docRef = adminDb.collection('projectContexts').doc(projectId);

  await docRef.set({
    ...context,
    lastUpdated: timestamp,
  });

  return projectId;
}

/**
 * Retrieve project context from Firestore
 */
export async function getProjectContext(
  projectId: string
): Promise<ProjectContext | null> {
  if (!projectId) {
    console.warn('getProjectContext called with no projectId');
    return null;
  }
  const docRef = adminDb.collection('projectContexts').doc(projectId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const storedData = docSnap.data() as StoredAnalysisResult;
    return storedData.context;
  } else {
    console.log(`No project context found for ID: ${projectId}`);
    return null;
  }
}

/**
 * Store project analysis result with timestamp
 */
export async function storeAnalysisResult(
  result: StoredAnalysisResult
): Promise<void> {
  if (!result.projectId) {
    throw new Error('Project ID is required to store analysis results.');
  }
  if (!result.context) {
    throw new Error('Context is required to store analysis results.');
  }

  const docRef = adminDb.collection('projectContexts').doc(result.projectId);

  const dataToStore = {
    ...result,
    storageTimestamp: FieldValue.serverTimestamp(),
  };

  await docRef.set(dataToStore, { merge: true });
}

/**
 * Get analysis history for a project
 */
export async function getAnalysisHistory(
  projectId: string,
  limit = 10
): Promise<StoredAnalysisResult[]> {
  try {
    const querySnapshot = await adminDb
      .collection('analysisResults')
      .where('projectId', '==', projectId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as StoredAnalysisResult;
      return data;
    });
  } catch (error) {
    console.error('Error retrieving analysis history:', error);
    return [];
  }
}
