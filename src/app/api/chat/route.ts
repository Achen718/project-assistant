import { NextRequest } from 'next/server';
import { Message } from 'ai';
import { processChatStream } from '@/lib/ai/server';
import { adminAuth } from '@/lib/firebase-admin';
import {
  getProjectContextById,
  StoredProjectContext,
} from '@/lib/analyzer/context-storage';
import { ProjectContext as ContextDomainProjectContext } from '@/lib/context/types';
import type {
  AnalyzerProjectContext,
  Technology as AnalyzerTechnology,
  ArchitecturalPattern as AnalyzerArchitecturalPattern,
  CodePattern as AnalyzerCodePattern,
} from '@/lib/analyzer/types';
import { DEV_USER_ID } from '../../../lib/store';

async function authenticateRequest(
  request: NextRequest
): Promise<string | null> {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.BYPASS_AUTH === 'true'
  ) {
    console.log(
      '[authenticateRequest] Bypassing auth for development (BYPASS_AUTH).'
    );
    return 'dev-user';
  }

  if (process.env.STATIC_USER_ID) {
    console.log(
      `[authenticateRequest] Using static user ID from environment variable: ${process.env.STATIC_USER_ID}`
    );
    return process.env.STATIC_USER_ID;
  }

  if (process.env.NODE_ENV === 'development' && DEV_USER_ID) {
    console.log(
      `[authenticateRequest] Using DEV_USER_ID for development: ${DEV_USER_ID}`
    );
    return DEV_USER_ID;
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

    const appContext = req.headers.get('x-app-context') || undefined;
    const { messages, contextId } = await req.json();
    const lastMessage = messages.findLast((m: Message) => m.role === 'user');

    if (!lastMessage || !lastMessage.content) {
      return Response.json({ error: 'No user message found' }, { status: 400 });
    }

    const previousMessages = messages.slice(0, -1);
    let projectContextForAI: ContextDomainProjectContext | undefined =
      undefined;

    if (contextId) {
      const storedResult: StoredProjectContext | null =
        await getProjectContextById(contextId);

      if (
        storedResult &&
        storedResult.userId === userId &&
        storedResult.context
      ) {
        const analyzerContext: AnalyzerProjectContext = storedResult.context;

        const technologiesForAI: AnalyzerTechnology[] =
          analyzerContext.technologies || [];
        const frameworksForAI: AnalyzerTechnology[] =
          analyzerContext.technologies?.filter(
            (t: AnalyzerTechnology) => t.type === 'framework'
          ) || [];

        const architecturalPatternsForAI =
          analyzerContext.architecturalPatterns?.map(
            (p: AnalyzerArchitecturalPattern) => ({
              name: p.name,
              description: p.description,
              components: p.components,
              locations: p.locations,
            })
          ) || [];

        const codePatternsForAI =
          analyzerContext.codePatterns?.map((p: AnalyzerCodePattern) => ({
            name: p.name,
            description: p.description,
            examples: p.examples,
            locations: p.locations,
          })) || [];

        projectContextForAI = {
          projectId: storedResult.id,
          projectName: analyzerContext.projectName,
          technologies: technologiesForAI,
          frameworks: frameworksForAI,
          architecturalPatterns: architecturalPatternsForAI,
          codePatterns: codePatternsForAI,
          bestPracticesObserved: analyzerContext.bestPracticesObserved || [],
          lastAnalyzed: storedResult.updatedAt
            ? new Date(storedResult.updatedAt).toISOString()
            : new Date().toISOString(),
        };
      }
    }

    const result = await processChatStream(
      lastMessage.content,
      previousMessages,
      appContext,
      projectContextForAI,
      userId
    );

    if (result instanceof Response) {
      return result;
    } else {
      // Assert the type of result if it's not a Response, assuming it has toDataStreamResponse
      return (
        result as { toDataStreamResponse: () => Response }
      ).toDataStreamResponse();
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
