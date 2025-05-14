import { ChatOpenAI } from '@langchain/openai';
// import { ChatAnthropic } from '@langchain/anthropic';

// Create model instances with configurable options
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
