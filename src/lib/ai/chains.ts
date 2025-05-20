import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createChatModel } from './models';
import { RunnableSequence } from '@langchain/core/runnables';

// Create a configurable AI assistant chain
export function createAssistantChain(
  systemPrompt: string,
  modelName = 'default',
  apiKey?: string,
  llmOptions: Record<string, any> = { maxRetries: 2 }
) {
  const model = createChatModel(modelName, apiKey, llmOptions);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '{input}'],
  ]);

  return RunnableSequence.from([prompt, model]);
}

// Example: Create a specialized chain with context
export function createPersonalizedAssistantChain(
  appContext: string,
  userName?: string,
  modelName = 'default'
) {
  const systemPrompt = `
  You are an AI assistant for ${appContext}.
  ${userName ? `You're speaking with ${userName}.` : ''}
  Be helpful, concise, and friendly.
  `;

  return createAssistantChain(systemPrompt, modelName);
}
