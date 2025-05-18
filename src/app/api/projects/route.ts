import { NextRequest } from 'next/server';
import { getUserProjects } from '@/lib/analyzer/context-storage';
import { adminAuth } from '@/lib/firebase-admin';

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

export async function GET(req: NextRequest): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all projects for the user
    const projects = await getUserProjects(userId);

    // Return the projects
    return Response.json({ projects });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to retrieve projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}
