import { createAssistantChain } from './chains';
import { streamText, type Message, type StreamTextResult } from 'ai';
import { openai } from '@ai-sdk/openai';
// import { groq } from '@ai-sdk/groq'; // Removed unused import
import type { ProjectContext } from '@/lib/context/types';
import { generateContextAwareResponse } from './context-adapter';
import { getProjectContext } from '@/lib/firebase/context-service';

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn(
    'OPENAI_API_KEY is not set. AI features may be limited. Using fallback model.'
  );
}
// Use GPT-3.5-turbo if key is missing, assuming it's more permissive or for testing
const openaiModel = openai(openaiApiKey ? 'gpt-4o' : 'gpt-3.5-turbo');
// To use Groq (ensure GROQ_API_KEY is in .env.local):
// import { groq } from '@ai-sdk/groq';
// const activeModel = groq('llama3-8b-8192');
// And use activeModel below instead of openaiModel

export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectId?: string
): Promise<string> {
  try {
    if (projectId) {
      const projectContextData = await getProjectContext(projectId);
      const responseText = await generateContextAwareResponse(
        message,
        history,
        projectContextData
      );
      return responseText;
    }

    const systemPrompt = createSystemPrompt(appContext);
    const chain = createAssistantChain(systemPrompt);

    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'human' : 'assistant',
      content: msg.content,
    }));

    const response = await chain.invoke({
      input: message,
      chat_history: formattedHistory,
    });

    return response.content as string;
  } catch (error) {
    console.error('Error processing chat:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

export async function processChatStream(
  messageContent: string,
  history: Message[] = [],
  appContext?: string,
  projectContextInput?: ProjectContext
): Promise<Response> {
  let systemPrompt = '';

  if (projectContextInput) {
    try {
      systemPrompt = createSystemPromptWithContext(
        appContext,
        projectContextInput
      );
    } catch (error) {
      console.error('Error creating system prompt with context:', error);
      systemPrompt = createSystemPrompt(appContext);
    }
  } else {
    systemPrompt = createSystemPrompt(appContext);
  }

  const formattedMessages: Message[] = [
    { id: crypto.randomUUID(), role: 'system', content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: 'user', content: messageContent },
  ];

  try {
    const result: StreamTextResult<never, string> = await streamText({
      model: openaiModel,
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Linter consistently rejects .toResponse(). Using fallback to textStream.
    if (result.textStream && result.textStream instanceof ReadableStream) {
      return new Response(result.textStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }, // Standard headers for text stream
      });
    } else {
      console.error(
        'AI streaming error: textStream not available or not a ReadableStream on streamText result.',
        result
      );
      return new Response(
        JSON.stringify({
          error: 'Failed to process AI stream request',
          details: 'textStream not available or invalid',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: unknown) {
    console.error('AI streaming error:', error);
    let errorMessage = 'Unknown streaming error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI stream request',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Creates a basic system prompt based on application context
 */
export function createSystemPrompt(appContext?: string): string {
  let basePrompt = appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';

  basePrompt += `\nWhen responding, if the user's message contains "Retrieved Context from Codebase", please use that information as the primary source for your answer. If the retrieved context is not relevant or insufficient, use your general knowledge.`;
  return basePrompt;
}

/**
 * Creates a detailed system prompt that incorporates project context
 */
export function createSystemPromptWithContext(
  appContext?: string,
  projectContext?: ProjectContext
): string {
  let prompt = createSystemPrompt(appContext);

  prompt += `\nIn addition to any retrieved codebase snippets, consider the following general project details. Synthesize all available information for the most comprehensive answer.`;

  if (!projectContext) {
    prompt += '\nNo general project details available for this session.';
    return prompt;
  }

  prompt += `\n\nGeneral Project Details:`;

  if (projectContext.technologies && projectContext.technologies.length > 0) {
    prompt += '\nProject Technologies:';
    prompt += `\n${projectContext.technologies.map((t) => t.name).join(', ')}`;
  }

  if (projectContext.frameworks && projectContext.frameworks.length > 0) {
    prompt += '\nFrameworks:';
    prompt += `\n${projectContext.frameworks.map((f) => f.name).join(', ')}`;
  }

  if (
    projectContext.architecturalPatterns &&
    projectContext.architecturalPatterns.length > 0
  ) {
    prompt += '\nArchitecture:';
    prompt += `\n${projectContext.architecturalPatterns
      .map((p) => p.name)
      .join(', ')}`;
  }

  if (projectContext.codePatterns && projectContext.codePatterns.length > 0) {
    prompt += '\nCode Patterns:';
    for (const pattern of projectContext.codePatterns) {
      prompt += `\n- ${pattern.name}: ${pattern.description}`;
    }
  }

  if (
    projectContext.bestPracticesObserved &&
    projectContext.bestPracticesObserved.length > 0
  ) {
    prompt += '\nBest Practices Observed:';
    for (const practice of projectContext.bestPracticesObserved) {
      prompt += `\n- ${practice}`;
    }
  }

  prompt += `\n\nWhen answering questions about this project:
1. Prioritize information from any "Retrieved Context from Codebase" in the user's message.
2. Supplement with these "General Project Details" (technologies, patterns, etc.) for broader understanding.
3. If conflicting, explicitly state the source of your information.
4. Suggest solutions that align with the existing codebase and its established patterns.
5. Use code examples that match the project's style if possible.`;

  return prompt;
}
