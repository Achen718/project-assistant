import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createChatModel } from './models';
import { RunnableSequence } from '@langchain/core/runnables';

// Create a configurable AI assistant chain
export function createAssistantChain(
  systemPrompt: string,
  modelName = 'gpt-4o',
  apiKey?: string
) {
  const model = createChatModel(modelName, apiKey);

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
  modelName = 'gpt-4o'
) {
  const systemPrompt = `
  You are an AI assistant for ${appContext}.
  ${userName ? `You're speaking with ${userName}.` : ''}
  Be helpful, concise, and friendly.
  `;

  return createAssistantChain(systemPrompt, modelName);
}
