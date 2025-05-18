import { Message as AIMessage } from 'ai';

// Re-export AI SDK's Message type
export type Message = AIMessage;

// App-specific types
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
