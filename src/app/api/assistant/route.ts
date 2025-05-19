import { NextRequest, NextResponse } from 'next/server';
import { processChat, processChatStream } from '@/lib/ai/server';
import { adminAuth } from '@/lib/firebase-admin';
import { generateEmbedding } from '@/lib/ai/embedding-utils';
import {
  findSimilarDocumentChunks,
  VectorQueryResult,
} from '@/lib/supabase/client';
// import { ProjectContext } from '@/lib/context/types'; // Commented out as not used yet

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

// --- RAG Configuration ---
const RAG_MATCH_THRESHOLD = 0.75; // Minimum similarity score to consider a chunk relevant
const RAG_MATCH_COUNT = 5; // Number of top chunks to retrieve

async function getRAGContext(
  userQuery: string,
  projectId?: string
): Promise<string> {
  if (!userQuery) return '';

  try {
    console.log(`RAG: Generating embedding for query: "${userQuery}"`);
    const queryEmbedding = await generateEmbedding(userQuery);

    if (!queryEmbedding) {
      console.log('RAG: Failed to generate query embedding.');
      return '';
    }

    console.log(
      `RAG: Finding similar document chunks (projectId: ${
        projectId || 'any'
      })...`
    );
    // TODO: Modify findSimilarDocumentChunks to accept projectId for filtering if your Supabase function supports it.
    // For now, it searches globally or based on its current implementation.
    const { data: similarChunks, error: retrievalError } =
      await findSimilarDocumentChunks(
        queryEmbedding,
        RAG_MATCH_THRESHOLD,
        RAG_MATCH_COUNT
      );

    if (retrievalError) {
      console.error(
        'RAG: Error retrieving similar chunks:',
        retrievalError.message
      );
      return '';
    }

    if (!similarChunks || similarChunks.length === 0) {
      console.log('RAG: No similar chunks found.');
      return '';
    }

    console.log(`RAG: Found ${similarChunks.length} similar chunks.`);

    // Format the retrieved chunks into a context string
    // Consider adding file paths or other metadata for clarity if needed by the LLM
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
      error instanceof Error
        ? error.message
        : 'Unknown error in RAG context retrieval';
    console.error(`RAG: Exception during context retrieval: ${message}`);
    return ''; // Fallback to no context on error
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

    // --- RAG: Retrieve Context ---
    const ragContext = await getRAGContext(message, projectId);
    // updated to let to allow for augmentation-- Originally const
    let augmentedMessage = message;
    if (ragContext) {
      console.log('RAG: Retrieved Context:\n', ragContext);
      // Option 1: Prepend context to the user's message (simple)
      augmentedMessage = `${ragContext}\n\nUser Question: ${message}`;
      // If Option 1 is enabled, change `const augmentedMessage` above back to `let`

      // Option 2: Pass ragContext separately to processChat / processChatStream
      // This would require modifying those functions in @/lib/ai/server.ts
      // For now, we'll log it. If processChat/Stream expect projectContext, we might try to adapt.
    }
    // --- End RAG ---

    // Determine if we should pass projectId or the full projectContext
    // For now, this example assumes processChat/Stream might take a simple projectId
    // or a more complex ProjectContext object.
    // If your processChat/Stream directly takes projectId and internally fetches
    // ProjectContext, that's fine. If it expects a full ProjectContext object
    // (like the one from @/lib/context/types), you'd fetch and format that here
    // potentially combining it with RAG context.

    // For now, we'll pass the original projectId or undefined.
    // The RAG context is in `ragContext` variable and `augmentedMessage` if you chose option 1.
    // We need to decide how `processChatStream` and `processChat` will consume this.

    if (streaming) {
      // TODO: Decide how to pass ragContext or augmentedMessage to processChatStream
      const stream = await processChatStream(
        augmentedMessage, // Using augmentedMessage if RAG context is prepended
        history || [],
        appContext,
        projectId // Or potentially a ProjectContext object enhanced with RAG
      );

      if (stream instanceof Response) {
        return stream;
      } else {
        return stream.toDataStreamResponse() as Response;
      }
    } else {
      // TODO: Decide how to pass ragContext or augmentedMessage to processChat
      const aiResponse = await processChat(
        augmentedMessage, // Using augmentedMessage if RAG context is prepended
        history || [],
        appContext,
        projectId // Or potentially a ProjectContext object enhanced with RAG
      );

      return NextResponse.json({
        id: crypto.randomUUID(),
        content: aiResponse,
        role: 'assistant',
        timestamp: Date.now(),
      });
    }
  } catch (error: unknown) {
    // Typed error
    console.error('Assistant API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
