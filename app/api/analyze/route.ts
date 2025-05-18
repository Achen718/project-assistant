import { NextRequest } from 'next/server';
import { analyzeProject } from '@/lib/analyzer';
import { adminAuth } from '@/lib/firebase-admin';
import path from 'path';
import os from 'os';

// Helper function to authenticate requests
async function authenticateRequest(request: NextRequest) {
  // Allow dev mode to bypass authentication if needed
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.BYPASS_AUTH === 'true'
  ) {
    return 'dev-user';
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { projectPath } = await req.json();

    if (!projectPath) {
      return Response.json(
        { error: 'Missing projectPath parameter' },
        { status: 400 }
      );
    }

    // Normalize path for the OS
    const normalizedPath = path.normalize(projectPath);

    // Security check - ensure the path doesn't navigate outside authorized areas
    // This is a basic check - you might want more sophisticated validation
    const userHome = os.homedir();
    if (!normalizedPath.startsWith(userHome)) {
      return Response.json({ error: 'Path not authorized' }, { status: 403 });
    }

    // Run the analysis
    const analysis = await analyzeProject(normalizedPath);

    // Return the result
    return Response.json({ analysis });
  } catch (error) {
    console.error('Project analysis error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to analyze project: ${errorMessage}` },
      { status: 500 }
    );
  }
}
