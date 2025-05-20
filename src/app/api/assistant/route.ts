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
): Promise<string | null> {
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
    // const userId = await authenticateRequest(request); // Temporarily disable auth
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    console.log('Assistant API /api/assistant POST handler was hit!');
    return NextResponse.json({ message: 'API endpoint reached successfully' });

    // const { message, history, streaming, projectId } = await request.json();

    // if (!message) {
    //   return NextResponse.json(
    //     { error: 'Message is required' },
    //     { status: 400 }
    //   );
    // }

    // const appContext = request.headers.get('x-app-context') || 'assistant';
    // const currentHistory = (history || []) as Message[];

    // let augmentedMessage = message;
    // if (process.env.RAG_ENABLED === 'true') {
    //   const ragContext = await getRAGContext(message, projectId);
    //   if (ragContext) {
    //     augmentedMessage = `${ragContext}\n\nUser Question: ${message}`;
    //   }
    // }

    // if (streaming) {
    //   let projectContextForStream: ProjectContext | undefined = undefined;
    //   if (projectId) {
    //     try {
    //       const fetchedContext = await getProjectContext(projectId);
    //       projectContextForStream =
    //         fetchedContext === null ? undefined : fetchedContext;
    //     } catch (contextError) {
    //       console.error(
    //         `Failed to fetch project context ID ${projectId} for streaming:`,
    //         contextError
    //       );
    //     }
    //   }

    //   const response = await processChatStream(
    //     augmentedMessage,
    //     currentHistory,
    //     appContext,
    //     projectContextForStream
    //   );
    //   return response;
    // } else {
    //   const aiResponseContent = await processChat(
    //     augmentedMessage,
    //     currentHistory,
    //     appContext,
    //     projectId
    //   );

    //   return NextResponse.json({
    //     id: crypto.randomUUID(),
    //     content: aiResponseContent,
    //     role: 'assistant',
    //     timestamp: Date.now(),
    //   });
    // }
  } catch (error: unknown) {
    console.error('Simple Assistant API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
