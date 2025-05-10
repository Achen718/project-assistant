'use client';
import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Message } from '@/lib/types';

interface ChatContainerProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatContainer = ({
  messages,
  loading,
  onSendMessage,
}: ChatContainerProps) => {
  return (
    <div className='flex flex-col h-[90vh] max-w-4xl mx-auto border rounded-lg overflow-hidden'>
      <div className='bg-blue-500 text-white p-4'>
        <h1 className='text-xl font-bold'>AI Assistant</h1>
      </div>
      <MessageList messages={messages} loading={loading} />
      <ChatInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatContainer;
