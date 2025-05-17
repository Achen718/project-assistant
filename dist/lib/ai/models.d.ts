import { ChatOpenAI } from '@langchain/openai';
/**
 * Creates a LangChain model instance for use with chains, agents and tools.
 * Note: For streaming responses with the Vercel AI SDK, use the openai() function instead.
 */
export declare function createChatModel(modelName: string, apiKey?: string, options?: {}): ChatOpenAI<import("@langchain/openai").ChatOpenAICallOptions>;
