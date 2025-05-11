'use client';
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder,
}: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='border-t p-4'>
      <div className='flex space-x-2'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled}
          className='flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          data-testid='chat-input'
        />
        <button
          type='submit'
          disabled={disabled || !input.trim()}
          className='bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300'
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
