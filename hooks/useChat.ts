'use client';
import { useState } from 'react';
import axios from 'axios';
import { useChatStore } from '@/lib/store';

export function useChat() {
  const {
    sessions,
    currentSessionId,
    loading,
    error,
    createSession,
    addMessage,
    setLoading,
    setError,
  } = useChatStore();

  const currentSession = currentSessionId
    ? sessions.find((session) => session.id === currentSessionId)
    : null;

  const messages = currentSession?.messages || [];

  const sendMessage = async (text: string) => {
    if (!currentSessionId) {
      createSession();
    }

    // Add user message to state
    addMessage(text, 'user');

    // Process AI response
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/chat', {
        message: text,
        history: messages,
      });

      addMessage(response.data.response, 'ai');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get AI response'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    currentSession,
  };
}
