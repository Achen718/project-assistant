'use client';

import { useEffect } from 'react';
import ChatContainer from '@/components/chat/ChatContainer';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/lib/store';

export default function Home() {
  const { createSession } = useChatStore();
  const { messages, loading, sendMessage } = useChat();

  // Create a default session when the app loads if none exists
  useEffect(() => {
    createSession();
  }, [createSession]);

  return (
    <main className='container mx-auto p-4'>
      <ChatContainer
        messages={messages}
        loading={loading}
        onSendMessage={sendMessage}
      />
    </main>
  );
}
