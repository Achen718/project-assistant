'use client';
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

const MessageList = ({ messages, loading = false }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isAI={message.sender === 'ai'}
        />
      ))}
      {loading && (
        <div className='flex justify-start mb-4'>
          <div className='bg-gray-100 rounded-lg p-3 max-w-[70%]'>
            <div className='flex space-x-2'>
              <div className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'></div>
              <div
                className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className='w-2 h-2 rounded-full bg-gray-400 animate-bounce'
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
