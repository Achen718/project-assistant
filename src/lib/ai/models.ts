import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
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
  // Prioritize Groq if its API key is available
  const groqApiKey = apiKey || process.env.GROQ_API_KEY;
  if (groqApiKey) {
    console.log('Using Groq model via Langchain:', modelName);
    return new ChatGroq({
      model: modelName === 'default' ? 'llama3-8b-8192' : modelName,
      apiKey: groqApiKey,
      ...options,
    });
  }

  // Fallback to OpenAI if Groq key is not set, but OpenAI key is
  const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    console.log('Falling back to OpenAI model via Langchain:', modelName);
    return new ChatOpenAI({
      modelName: modelName === 'default' ? 'gpt-3.5-turbo' : modelName,
      openAIApiKey: openaiApiKey,
      ...options,
    });
  }

  // If neither key is set, throw an error or handle appropriately
  throw new Error(
    'No API key configured for Groq or OpenAI for Langchain chat model.'
  );

  // // Default to GPT-4 if modelName didn't include gpt, this logic is now changed
  // return new ChatOpenAI({
  //   modelName: 'gpt-4o',
  //   openAIApiKey: key,
  //   ...options,
  // });
}
