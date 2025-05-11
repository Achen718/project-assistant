'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Message } from '@/lib/types';

export interface AIChatComponentProps {
  apiKey?: string;
  apiEndpoint?: string;
  initialMessages?: Message[];
  placeholder?: string;
  className?: string;
  onMessageSent?: (message: Message) => void;
  onResponseReceived?: (message: Message) => void;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({
  apiKey,
  apiEndpoint = '/api/assistant',
  initialMessages = [],
  placeholder = 'Type your message...',
  className = '',
  onMessageSent,
  onResponseReceived,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    // Add user message to state
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    // Notify about sent message
    onMessageSent?.(userMessage);

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Send request to API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Create AI message
      const aiMessage: Message = {
        id: data.id || uuidv4(),
        text: data.response,
        sender: 'ai',
        timestamp: data.timestamp || Date.now(),
      };

      // Add AI message to state
      setMessages((prev) => [...prev, aiMessage]);

      // Notify about received response
      onResponseReceived?.(aiMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to get AI response'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className='flex-1 overflow-y-auto'>
        <MessageList messages={messages} loading={loading} />
      </div>

      {error && (
        <div className='p-2 text-red-500 text-sm text-center'>{error}</div>
      )}

      <div className='mt-auto'>
        <ChatInput
          onSendMessage={sendMessage}
          disabled={loading}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default AIChatComponent;
