import { ChatOpenAI } from '@langchain/openai';
// import { ChatAnthropic } from '@langchain/anthropic';

/**
 * Creates a LangChain model instance for use with chains, agents and tools.
 * Note: For streaming responses with the Vercel AI SDK, use the openai() function instead.
 */
export function createChatModel(
  modelName: string,
  apiKey?: string,
  options = {}
) {
  // Default to environment variables if not provided
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (modelName.includes('gpt')) {
    return new ChatOpenAI({
      modelName,
      openAIApiKey: key,
      ...options,
    });
  }
  // else if (modelName.includes('claude')) {
  //   return new ChatAnthropic({
  //     modelName,
  //     anthropicApiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  //     ...options,
  //   });
  // }

  // Default to GPT-4
  return new ChatOpenAI({
    modelName: 'gpt-4o',
    openAIApiKey: key,
    ...options,
  });
}
