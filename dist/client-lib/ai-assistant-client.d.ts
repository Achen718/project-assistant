import { Message, ChatSession } from '@/lib/types';
export interface AIAssistantClientOptions {
    apiUrl: string;
    apiKey: string;
    appContext?: string;
}
export declare function createAIAssistant(options: AIAssistantClientOptions): {
    sendMessage: (message: string, history?: Message[]) => Promise<Message>;
    getSessions: () => Promise<ChatSession[]>;
    createSession: (title?: string) => Promise<ChatSession>;
    getSessionMessages: (sessionId: string) => Promise<Message[]>;
    sendMessageToSession: (sessionId: string, content: string) => Promise<{
        userMessage: Message;
        aiMessage: Message;
    }>;
    updateSession: (sessionId: string, data: Partial<ChatSession>) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    streamMessage: (message: string, history: Message[] | undefined, onChunk: (chunk: string) => void) => Promise<Message>;
};
