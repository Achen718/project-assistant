import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  updateChatSession,
  deleteChatSession,
  getSessionMessages,
} from '@/lib/firestore-service';

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

// GET /api/sessions/[sessionId] - Get session details and messages
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

    return NextResponse.json({ sessionId, messages });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[sessionId] - Update session details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const updateData = await request.json();

    await updateChatSession(sessionId, updateData);

    return NextResponse.json({
      success: true,
      sessionId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[sessionId] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    await deleteChatSession(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
