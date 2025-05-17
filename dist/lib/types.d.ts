import { Message as AIMessage } from 'ai';
export type Message = AIMessage;
export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}
