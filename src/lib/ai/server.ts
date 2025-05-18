import { createAssistantChain } from './chains';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Message } from 'ai';
import { generateContextAwareResponse } from './context-adapter';
import { getProjectContext } from '@/lib/firebase/context-service';
import { ProjectContext } from '@/lib/context/types';

const openaiModel = openai('gpt-4o');

// Process a chat with standard response
export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectId?: string
) {
  try {
    // If projectId is provided, fetch project context and use the context adapter
    if (projectId) {
      const projectContext = await getProjectContext(projectId);
      const response = await generateContextAwareResponse(
        message,
        history,
        projectContext
      );
      return response;
    }

    // Otherwise, use the standard chain-based approach
    const systemPrompt = createSystemPrompt(appContext);
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
  } catch (error) {
    console.error('Error processing chat:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

// Process chat with streaming response for Vercel AI SDK
export async function processChatStream(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectContext?: ProjectContext
) {
  // For streaming, we'll use the AI SDK directly
  // First create appropriate system prompt
  let systemPrompt = '';

  if (projectContext) {
    try {
      // If context is available, create an enhanced system prompt
      systemPrompt = createSystemPromptWithContext(appContext, projectContext);
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
 * Creates a basic system prompt based on application context
 */
function createSystemPrompt(appContext?: string): string {
  return appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';
}

/**
 * Creates a detailed system prompt that incorporates project context
 */
function createSystemPromptWithContext(
  appContext?: string,
  projectContext?: ProjectContext
): string {
  // Base prompt
  let prompt = createSystemPrompt(appContext);

  if (!projectContext) {
    return prompt;
  }

  // Enhance with project context
  prompt += `\n\nYou are assisting with a software project with the following context:`;

  // Add information about the technology stack
  if (projectContext.technologies && projectContext.technologies.length > 0) {
    prompt += '\n\nProject Technologies:';
    prompt += `\n${projectContext.technologies.join(', ')}`;
  }

  // Add frameworks
  if (projectContext.frameworks && projectContext.frameworks.length > 0) {
    prompt += '\n\nFrameworks:';
    prompt += `\n${projectContext.frameworks.join(', ')}`;
  }

  // Add architectural patterns
  if (projectContext.architecture && projectContext.architecture.length > 0) {
    prompt += '\n\nArchitecture:';
    prompt += `\n${projectContext.architecture.join(', ')}`;
  }

  // Add code patterns
  if (projectContext.codePatterns && projectContext.codePatterns.length > 0) {
    prompt += '\n\nCode Patterns:';
    for (const pattern of projectContext.codePatterns) {
      prompt += `\n- ${pattern.name}: ${pattern.description}`;
    }
  }

  // Add best practices
  if (projectContext.bestPractices && projectContext.bestPractices.length > 0) {
    prompt += '\n\nBest Practices:';
    for (const practice of projectContext.bestPractices) {
      prompt += `\n- ${practice}`;
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
