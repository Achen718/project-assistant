import { Message } from '@ai-sdk/react';
import { ChatSession } from './types';
export declare function createChatSession(userId: string, title?: string): Promise<string>;
export declare function updateChatSession(sessionId: string, data: Partial<ChatSession>): Promise<void>;
export declare function getUserChatSessions(userId: string): Promise<ChatSession[]>;
export declare function deleteChatSession(sessionId: string): Promise<void>;
export declare function addMessageToSession(sessionId: string, message: Omit<Message, 'id'>): Promise<string>;
export declare function getSessionMessages(sessionId: string): Promise<Message[]>;
