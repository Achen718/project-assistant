import { createAssistantChain } from './chains';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Message } from 'ai';

const openaiModel = openai('gpt-4o');

// Process a chat with standard response
export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string
) {
  // Create system prompt based on context
  const systemPrompt = appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';

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
  appContext?: string
) {
  const systemPrompt = appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';

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
