import { NextRequest } from 'next/server';
import { Message } from 'ai';
import { processChatStream } from '@/lib/ai/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getProjectContextById } from '@/lib/analyzer/context-storage';

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

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get context from headers if available
    const appContext = req.headers.get('x-app-context') || undefined;

    // Parse request body
    const { messages, contextId } = await req.json();

    // Get the last message from the user
    const lastMessage = messages.findLast((m: Message) => m.role === 'user');

    if (!lastMessage || !lastMessage.content) {
      return Response.json({ error: 'No user message found' }, { status: 400 });
    }

    // Get previous messages for context (excluding the last user message)
    const previousMessages = messages.slice(0, -1);

    // Load project context if a contextId was provided
    let projectContext = undefined;
    if (contextId) {
      const storedContext = await getProjectContextById(contextId);
      if (storedContext && storedContext.userId === userId) {
        projectContext = storedContext.context;
      }
    }

    // Get the result from processChatStream
    const result = await processChatStream(
      lastMessage.content,
      previousMessages,
      appContext,
      projectContext
    );

    // Check the result type before using toDataStreamResponse
    if (result instanceof Response) {
      // It's already a Response object, return it directly
      return result;
    } else {
      // It's a StreamTextResult, convert to Response
      return result.toDataStreamResponse() as Response;
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
