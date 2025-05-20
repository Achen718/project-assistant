import { NextRequest, NextResponse } from 'next/server';
import { processChat, processChatStream } from '@/lib/ai/server';
import { adminAuth } from '@/lib/firebase-admin';
import { generateEmbedding } from '@/lib/ai/embedding-utils';
import {
  findSimilarDocumentChunks,
  VectorQueryResult,
} from '@/lib/supabase/client';
import { getProjectContext } from '@/lib/firebase/context-service'; // Import for project context
import type { ProjectContext } from '@/lib/context/types'; // Type for project context
import type { Message } from 'ai'; // For history type

// Authenticate API requests (using Firebase Admin)
async function authenticateRequest(
  request: NextRequest
): Promise<string | null | object> {
  const authHeader = request.headers.get('authorization');

  // Allow all requests in development if a specific header is present
  if (
    process.env.NODE_ENV === 'development' &&
    request.headers.get('X-Development-Allow') === 'true'
  ) {
    console.warn(
      'Development: Allowing request without strict authentication via X-Development-Allow header.'
    );
    return { devUser: true, userId: 'dev-user' }; // Return a generic dev user
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or not Bearer');
    return null;
  }
  const token = authHeader.split(' ')[1];

  // TODO: Implement proper static API key validation if needed for production
  // For now, let's assume any bearer token in dev could be a simple static key
  // if Firebase auth is not the primary path or fails.

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log(
      'Authenticated with Firebase ID token for UID:',
      decodedToken.uid
    );
    return decodedToken.uid; // Return UID for Firebase user
  } catch (firebaseError) {
    // If Firebase ID token verification fails, AND we are in development,
    // we can assume it might be a static API key for simplicity.
    // In production, you would need a more robust way to differentiate or validate static keys.
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Firebase ID token verification failed. In development, treating as possible static key. Token:',
        token,
        'Error:',
        (firebaseError as Error).message
      );
      // For development, accept any non-empty token as a "static key user"
      // if it wasn't a valid Firebase token.
      // DO NOT USE THIS LOGIC IN PRODUCTION for static keys without actual validation.
      if (token) {
        return { staticKeyUser: true, keyHint: token.substring(0, 5) + '...' };
      }
    }
    console.error(
      'Authentication failed (Firebase ID token error):',
      (firebaseError as Error).message
    );
    return null;
  }
}

// --- RAG Configuration ---
const RAG_MATCH_THRESHOLD = 0.75;
const RAG_MATCH_COUNT = 5;

async function getRAGContext(
  userQuery: string,
  projectId?: string
): Promise<string> {
  if (!userQuery) return '';
  try {
    const queryEmbedding = await generateEmbedding(userQuery);
    if (!queryEmbedding) {
      return '';
    }
    const { data: similarChunks, error: retrievalError } =
      await findSimilarDocumentChunks(
        queryEmbedding,
        RAG_MATCH_THRESHOLD,
        RAG_MATCH_COUNT
      );

    if (retrievalError) {
      console.error('RAG: Error retrieving chunks:', retrievalError.message);
      return '';
    }
    if (!similarChunks || similarChunks.length === 0) {
      return '';
    }
    const contextString = similarChunks
      .map(
        (chunk: VectorQueryResult) =>
          `Source: ${chunk.file_path} (Similarity: ${chunk.similarity.toFixed(
            2
          )})\nContent:\n${chunk.chunk_text}`
      )
      .join('\n\n---\n\n');
    return `Retrieved Context from Codebase (Project: ${
      projectId || 'any'
    }):\n---\n${contextString}\n---`;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown RAG error';
    console.error(`RAG: Exception: ${message}`);
    return '';
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history, streaming, projectId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const appContext = request.headers.get('x-app-context') || 'assistant';
    const currentHistory = (history || []) as Message[];

    let augmentedMessage = message;
    if (process.env.RAG_ENABLED === 'true') {
      const ragContext = await getRAGContext(message, projectId);
      if (ragContext) {
        augmentedMessage = `${ragContext}\n\nUser Question: ${message}`;
      }
    }

    if (streaming) {
      let projectContextForStream: ProjectContext | undefined = undefined;
      if (projectId) {
        try {
          const fetchedContext = await getProjectContext(projectId);
          projectContextForStream =
            fetchedContext === null ? undefined : fetchedContext;
        } catch (contextError) {
          console.error(
            `Failed to fetch project context ID ${projectId} for streaming:`,
            contextError
          );
        }
      }

      // The processChatStream function in server.ts already checks if Groq (activeModel) is configured
      // and returns a 503 if not. So, no explicit activeModel check needed here.
      const response = await processChatStream(
        augmentedMessage,
        currentHistory,
        appContext,
        projectContextForStream // Pass the fetched context or undefined
      );
      return response;
    } else {
      console.log('[API Route] Calling processChat for non-streaming.');
      try {
        const aiResponseContent = await processChat(
          augmentedMessage,
          currentHistory,
          appContext,
          projectId
        );
        console.log(
          '[API Route] processChat returned successfully with content:',
          aiResponseContent
        );
        return NextResponse.json({
          id: crypto.randomUUID(),
          content: aiResponseContent,
          role: 'assistant',
          timestamp: Date.now(),
        });
      } catch (processChatError) {
        console.error(
          '[API Route] Error explicitly caught from processChat:',
          processChatError
        );
        const errorMessage =
          processChatError instanceof Error
            ? processChatError.message
            : 'Failed to process request in processChat';
        return NextResponse.json(
          { error: errorMessage, source: 'processChat_catch' },
          { status: 500 }
        );
      }
    }
  } catch (error: unknown) {
    console.error('[API Route] Outer catch block error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'General API processing failed';
    return NextResponse.json(
      { error: errorMessage, source: 'outer_catch' },
      { status: 500 }
    );
  }
}
