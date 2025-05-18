import { createAssistantChain } from './chains';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Message } from 'ai';
import { ProjectContext } from '../analyzer';

const openaiModel = openai('gpt-4o');

// Process a chat with standard response
export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectContext?: ProjectContext
) {
  // Create system prompt based on context
  const systemPrompt = createSystemPrompt(appContext, projectContext);

  const chain = createAssistantChain(systemPrompt);

  // Format history for LangChain (convert from AI SDK Message to LangChain format)
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'human' : 'assistant',
    content: msg.content,
  }));

  // Get response
  const response = await chain.invoke({
    input: message,
    chat_history: formattedHistory,
  });

  return response.content;
}

// Process chat with streaming response for Vercel AI SDK
export async function processChatStream(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectContext?: ProjectContext
) {
  const systemPrompt = createSystemPrompt(appContext, projectContext);

  // Create properly typed messages using AI SDK types
  const formattedMessages: Message[] = [
    { id: crypto.randomUUID(), role: 'system', content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: 'user', content: message },
  ];

  try {
    // Using the streamText function according to AI SDK documentation
    return streamText({
      model: openaiModel,
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
 * Creates a detailed system prompt that incorporates project context
 */
function createSystemPrompt(
  appContext?: string,
  projectContext?: ProjectContext
): string {
  // Base prompt
  let prompt = appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';

  if (!projectContext) {
    return prompt;
  }

  // Enhance with project context
  prompt += `\n\nYou are assisting with a project called "${projectContext.name}".`;

  // Add information about the technology stack
  if (projectContext.technologies.length > 0) {
    prompt += '\n\nProject Technologies:';

    // Group technologies by type
    const techByType: Record<string, string[]> = {};

    for (const tech of projectContext.technologies) {
      if (!techByType[tech.type]) {
        techByType[tech.type] = [];
      }

      const techInfo = tech.version
        ? `${tech.name} (${tech.version})`
        : tech.name;

      techByType[tech.type].push(techInfo);
    }

    // Add each group to the prompt
    for (const [type, techs] of Object.entries(techByType)) {
      prompt += `\n- ${
        type.charAt(0).toUpperCase() + type.slice(1)
      }: ${techs.join(', ')}`;
    }
  }

  // Add architectural patterns
  if (projectContext.patterns.architectural.length > 0) {
    prompt += '\n\nArchitectural Patterns:';
    for (const pattern of projectContext.patterns.architectural) {
      prompt += `\n- ${pattern.name}: ${pattern.description}`;
    }
  }

  // Add code patterns
  if (projectContext.patterns.code.length > 0) {
    prompt += '\n\nCode Patterns:';
    for (const pattern of projectContext.patterns.code) {
      prompt += `\n- ${pattern.name}: ${pattern.description}`;
    }
  }

  // Add guidance for the assistant
  prompt += `\n
When answering questions about this project:
1. Consider the technologies and frameworks being used
2. Follow the established architectural patterns
3. Suggest solutions that align with the existing codebase
4. Be specific and reference relevant technologies from the stack
5. Use code examples that match the project's patterns and style`;

  return prompt;
}
