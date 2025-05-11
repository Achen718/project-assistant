import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  createChatSession,
  getUserChatSessions,
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

// GET /api/sessions - Get all sessions for a user
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getUserChatSessions(userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    const sessionId = await createChatSession(userId, title || 'New Chat');

    return NextResponse.json({
      id: sessionId,
      title: title || 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
