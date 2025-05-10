'use client';
import React from 'react';
import { Message } from '@/lib/types';

interface MessageItemProps {
  message: Message;
  isAI: boolean;
}

const MessageItem = ({ message, isAI }: MessageItemProps) => {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isAI ? 'bg-gray-100' : 'bg-blue-500 text-white'
        }`}
      >
        <p className='text-sm'>{message.text}</p>
        <span className='text-xs text-gray-500 block mt-1'>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
