import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// GET /api/auth/api-keys - Get all API keys for current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get API keys from Firestore
    const keysSnapshot = await adminDb
      .collection('apiKeys')
      .where('userId', '==', userId)
      .get();

    const keys = keysSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      prefix: doc.data().prefix,
      createdAt: doc.data().createdAt,
      lastUsed: doc.data().lastUsed,
    }));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('API Keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/auth/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Generate a new API key
    const apiKey = `ai_${uuidv4().replace(/-/g, '')}`;
    const prefix = apiKey.substring(0, 8);

    // Store the API key in Firestore
    await adminDb.collection('apiKeys').add({
      userId,
      name,
      key: apiKey, // Store the full key securely
      prefix, // Store a prefix for display purposes
      createdAt: Date.now(),
      lastUsed: null,
    });

    return NextResponse.json({
      name,
      key: apiKey, // Return the full key only once
      prefix,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('API Keys error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { keyId } = await request.json();

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    // Verify the key belongs to this user
    const keyDoc = await adminDb.collection('apiKeys').doc(keyId).get();

    if (!keyDoc.exists || keyDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Delete the key
    await adminDb.collection('apiKeys').doc(keyId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Keys error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
