import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToAI } from '@/lib/ai-service';
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
    // pass options to the AI service if needed
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process the message with the AI service
    const aiResponse = await sendMessageToAI(
      message,
      history || []
      // options can be used to pass additional parameters to the AI service
    );

    return NextResponse.json({
      id: crypto.randomUUID(),
      response: aiResponse,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
