import { NextRequest, NextResponse } from 'next/server';
import { processChat, processChatStream } from '@/lib/ai/server';
import { adminAuth } from '@/lib/firebase-admin';

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

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add support for streaming parameter
    const { message, history, streaming } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get context from headers if available
    const appContext = request.headers.get('x-app-context') || 'assistant';

    // Handle streaming vs. non-streaming
    if (streaming) {
      const stream = await processChatStream(
        message,
        history || [],
        appContext
      );
      // Return the stream directly
      return stream;
    } else {
      // Process normally for non-streaming requests
      const aiResponse = await processChat(message, history || [], appContext);

      return NextResponse.json({
        id: crypto.randomUUID(),
        content: aiResponse, // Changed from response to content for consistency
        role: 'assistant', // Changed from undefined to role for consistency
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
