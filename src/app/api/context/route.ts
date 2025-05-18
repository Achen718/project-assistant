import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  storeProjectContext,
  getProjectContext,
} from '@/lib/firebase/context-service';

// Authenticate API requests
async function authenticateRequest(request: NextRequest) {
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

// POST /api/context - Store project context
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectContext } = await request.json();

    if (!projectContext || !projectContext.projectId) {
      return NextResponse.json(
        { error: 'Invalid project context data' },
        { status: 400 }
      );
    }

    // Store the project context
    await storeProjectContext(projectContext.projectId, projectContext);

    return NextResponse.json({
      success: true,
      projectId: projectContext.projectId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Context API error:', error);
    return NextResponse.json(
      { error: 'Failed to store project context' },
      { status: 500 }
    );
  }
}

// GET /api/context?projectId={projectId} - Get project context
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract projectId from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project context
    const projectContext = await getProjectContext(projectId);

    if (!projectContext) {
      return NextResponse.json(
        { error: 'Project context not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ projectContext });
  } catch (error) {
    console.error('Context API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project context' },
      { status: 500 }
    );
  }
}
