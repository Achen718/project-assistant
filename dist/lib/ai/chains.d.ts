import { RunnableSequence } from '@langchain/core/runnables';
export declare function createAssistantChain(systemPrompt: string, modelName?: string, apiKey?: string): RunnableSequence<any, import("@langchain/core/messages").AIMessageChunk>;
export declare function createPersonalizedAssistantChain(appContext: string, userName?: string, modelName?: string): RunnableSequence<any, import("@langchain/core/messages").AIMessageChunk>;
