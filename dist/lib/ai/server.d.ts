import type { Message } from 'ai';
export declare function processChat(message: string, history?: Message[], appContext?: string): Promise<import("@langchain/core/messages").MessageContent>;
export declare function processChatStream(message: string, history?: Message[], appContext?: string): Promise<Response | import("ai").StreamTextResult<import("ai").ToolSet, never>>;
