import { NextRequest } from 'next/server';
import {
  getProjectContextById,
  deleteProjectContext,
} from '@/lib/analyzer/context-storage';
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

// Get a project context by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contextId = params.id;
    const context = await getProjectContextById(contextId);

    if (!context) {
      return Response.json({ error: 'Context not found' }, { status: 404 });
    }

    // Check if the context belongs to the user
    if (context.userId !== userId) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return the context
    return Response.json(context);
  } catch (error) {
    console.error('Error retrieving project context:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to retrieve project context: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Delete a project context
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contextId = params.id;
    const context = await getProjectContextById(contextId);

    if (!context) {
      return Response.json({ error: 'Context not found' }, { status: 404 });
    }

    // Check if the context belongs to the user
    if (context.userId !== userId) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the context
    await deleteProjectContext(userId, context.projectPath);

    // Return success
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting project context:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to delete project context: ${errorMessage}` },
      { status: 500 }
    );
  }
}
