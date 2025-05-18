import { adminDb } from '@/lib/firebase-admin';
import { ProjectContext, AnalysisResult } from '@/lib/context/types';

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
  try {
    const docRef = adminDb.collection('projectContexts').doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as ProjectContext;
  } catch (error) {
    console.error('Error retrieving project context:', error);
    return null;
  }
}

/**
 * Store project analysis result with timestamp
 */
export async function storeAnalysisResult(
  analysisResult: AnalysisResult
): Promise<string> {
  const { projectId, context, timestamp } = analysisResult;
  const docRef = adminDb.collection('analysisResults').doc();

  await docRef.set({
    projectId,
    context,
    timestamp,
    createdAt: Date.now(),
  });

  // Also update the current project context
  await storeProjectContext(projectId, context);

  return docRef.id;
}

/**
 * Get analysis history for a project
 */
export async function getAnalysisHistory(
  projectId: string,
  limit = 10
): Promise<AnalysisResult[]> {
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
      const data = doc.data();
      return {
        projectId: data.projectId,
        context: data.context,
        timestamp: data.timestamp,
      };
    });
  } catch (error) {
    console.error('Error retrieving analysis history:', error);
    return [];
  }
}
