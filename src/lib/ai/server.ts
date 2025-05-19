import { createAssistantChain } from './chains';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
// import { groq } from '@ai-sdk/groq'; // Removed unused import
import type { Message } from 'ai';
import { generateContextAwareResponse } from './context-adapter';
import { getProjectContext } from '@/lib/firebase/context-service';
import { ProjectContext } from '@/lib/context/types';

const openaiModel = openai('gpt-4o');
// To use Groq (ensure GROQ_API_KEY is in .env.local):
// import { groq } from '@ai-sdk/groq';
// const activeModel = groq('llama3-8b-8192');
// And use activeModel below instead of openaiModel

export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectId?: string
) {
  try {
    if (projectId) {
      const projectContext = await getProjectContext(projectId);
      // TODO: Review if generateContextAwareResponse needs to be aware of pre-augmented message
      // or if it should receive raw message and RAG context separately.
      const response = await generateContextAwareResponse(
        message, // This is potentially augmentedMessage from the API route
        history,
        projectContext
      );
      return response;
    }

    const systemPrompt = createSystemPrompt(appContext);
    const chain = createAssistantChain(systemPrompt);

    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'human' : 'assistant',
      content: msg.content,
    }));

    const response = await chain.invoke({
      input: message, // This is potentially augmentedMessage from the API route
      chat_history: formattedHistory,
    });

    return response.content;
  } catch (error) {
    console.error('Error processing chat:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

export async function processChatStream(
  message: string, // This is potentially augmentedMessage from the API route
  history: Message[] = [],
  appContext?: string,
  projectContextInput?: ProjectContext // Renamed to avoid conflict with context fetched via projectId if that pattern changes
) {
  let systemPrompt = '';

  // Note: If projectContextInput is provided, it's the general context.
  // The RAG context is already prepended to the 'message' variable by the API route.
  if (projectContextInput) {
    try {
      systemPrompt = createSystemPromptWithContext(
        appContext,
        projectContextInput
      );
    } catch (error) {
      console.error(
        'Error creating system prompt with project context:',
        error
      );
      systemPrompt = createSystemPrompt(appContext);
    }
  } else {
    systemPrompt = createSystemPrompt(appContext);
  }

  const formattedMessages: Message[] = [
    { id: crypto.randomUUID(), role: 'system', content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: 'user', content: message }, // message here already contains RAG + original query
  ];

  try {
    return streamText({
      model: openaiModel, // or activeModel if using Groq/other
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 2000,
    });
  } catch (error) {
    console.error('AI streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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
  projectContext?: ProjectContext // This is the broader project context, not the RAG snippets
): string {
  let prompt = createSystemPrompt(appContext); // Gets the base prompt which now includes RAG instruction

  // Further instructions on how to use general project details in conjunction with RAG context.
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
