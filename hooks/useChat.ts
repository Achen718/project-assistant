'use client';
import { useChatStore } from '@/lib/store';
import { useChat as useAISDKChat } from '@ai-sdk/react';
import React from 'react';

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

  // Get current session and messages
  const currentSession = currentSessionId
    ? sessions.find((session) => session.id === currentSessionId)
    : null;
  const messages = currentSession?.messages || [];

  // Use AI SDK for streaming with current package name
  const {
    input,
    handleInputChange,
    handleSubmit: handleAISubmit,
    status,
    error: aiError,
  } = useAISDKChat({
    api: '/api/chat',
    headers: {
      'x-app-context': 'personal-assistant',
    },
    onResponse: (response) => {
      // Any additional handling needed
      if (!response.ok) {
        setError('Failed to get AI response');
      }
    },
    onFinish: (message) => {
      // Save to Firestore via your store
      addMessage(message.content, 'ai');
      // Set loading state to false when the AI response is complete
      setLoading(false);
    },
  });

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Set loading state to true when sending a message
    setLoading(true);

    if (!currentSessionId) {
      await createSession();
    }

    // Add user message to state
    addMessage(text, 'user');

    // Use a simple object that matches the FormEvent interface
    handleAISubmit({
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>);
  };

  // Handle any AI SDK specific errors
  if (aiError) {
    console.error('AI SDK error:', aiError);
    setError(aiError.toString());
  }

  return {
    messages,
    // Fix: Check for correct status values (submitted or streaming means loading)
    loading: loading || status === 'submitted' || status === 'streaming',
    error: error || aiError,
    sendMessage,
    currentSession,
    input,
    handleInputChange,
  };
}
