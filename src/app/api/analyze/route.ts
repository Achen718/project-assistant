import { NextRequest, NextResponse } from 'next/server';
import { analyzeProject } from '@/lib/analyzer';
import { storeProjectContext } from '@/lib/analyzer/context-storage';
import { getFirebaseUser } from '@/lib/auth/firebase-auth-utils'; // Corrected import
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Changed to NextResponse
  try {
    const firebaseUser = await getFirebaseUser(req);
    if (!firebaseUser || !firebaseUser.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = firebaseUser.uid; // Use Firebase UID

    const { projectPath } = await req.json();

    if (!projectPath) {
      return NextResponse.json(
        { error: 'Missing projectPath parameter' },
        { status: 400 }
      );
    }

    const normalizedPath = path.normalize(projectPath);
    const userHome = os.homedir();
    // Consider a more robust path validation, perhaps using ALLOWED_BASE_PROJECT_DIR like in index-project route
    if (!normalizedPath.startsWith(userHome)) {
      return NextResponse.json(
        { error: 'Path not authorized' },
        { status: 403 }
      );
    }

    const analysis = await analyzeProject(normalizedPath);
    const contextId = await storeProjectContext(
      userId,
      normalizedPath,
      analysis
    );

    return NextResponse.json({
      analysis,
      contextId,
    });
  } catch (error) {
    console.error('Project analysis error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to analyze project: ${errorMessage}` },
      { status: 500 }
    );
  }
}
