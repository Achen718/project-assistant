import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  addMessageToSession,
  getSessionMessages,
} from '@/lib/firestore-service';
import { processChat } from '@/lib/ai/server';

// Helper function to authenticate requests
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

// GET /api/sessions/[sessionId]/messages - Get messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const messages = await getSessionMessages(sessionId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/sessions/[sessionId]/messages - Add a message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Store user message
    const timestamp = Date.now();
    const userMessageId = await addMessageToSession(sessionId, {
      content,
      role: 'user',
      createdAt: new Date(timestamp),
    });

    // Get existing conversation history
    const existingMessages = await getSessionMessages(sessionId);

    // Get AI response
    const aiResponse = await processChat(
      content,
      existingMessages,
      'session-assistant'
    );

    // Convert AI response to string if it's a complex object
    const aiResponseText =
      typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

    // Store AI response
    const aiTimestamp = Date.now();
    const aiMessageId = await addMessageToSession(sessionId, {
      content: aiResponseText,
      role: 'assistant',
      createdAt: new Date(aiTimestamp),
    });

    return NextResponse.json({
      userMessage: {
        id: userMessageId,
        content,
        role: 'user',
        timestamp,
      },
      aiMessage: {
        id: aiMessageId,
        content: aiResponseText,
        role: 'assistant',
        timestamp: aiTimestamp,
      },
    });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
