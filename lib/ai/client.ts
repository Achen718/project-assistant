import { useChat, Message as AISDKMessage } from '@ai-sdk/react';
import { Message } from '../types';

// Convert between message formats
export function convertToAISDKMessages(messages: Message[]): AISDKMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    content: msg.text,
    role: msg.sender === 'user' ? 'user' : 'assistant',
  }));
}

export function convertFromAISDKMessages(messages: AISDKMessage[]): Message[] {
  return messages.map((msg) => ({
    id: msg.id,
    text: msg.content,
    sender: msg.role === 'user' ? 'user' : 'ai',
    timestamp: Date.now(),
  }));
}

// React hook for using AI SDK with custom app context
export function useAIChat(appContext?: string) {
  const headers: Record<string, string> = {};

  if (appContext) {
    headers['x-app-context'] = appContext;
  }

  return useChat({
    api: '/api/chat',
    headers,
  });
}
