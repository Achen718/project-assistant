'use client';
import { useChatStore } from '@/lib/store';
import { sendMessageToAI } from '@/lib/ai-service';

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
      const response = await sendMessageToAI(text, messages);
      addMessage(response, 'ai');
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
