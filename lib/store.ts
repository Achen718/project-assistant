import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from './types';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  createSession: () => string;
  switchSession: (sessionId: string) => void;
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  loading: false,
  error: null,

  createSession: () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSessionId: newSession.id,
    }));

    return newSession.id;
  },

  switchSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  addMessage: (text, sender) => {
    const { currentSessionId, sessions } = get();
    if (!currentSessionId) return;

    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: Date.now(),
    };

    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: Date.now(),
              title:
                session.messages.length === 0 && sender === 'user'
                  ? text.slice(0, 30) + (text.length > 30 ? '...' : '')
                  : session.title,
            }
          : session
      ),
    }));
  },

  setLoading: (isLoading) => {
    set({ loading: isLoading });
  },

  setError: (error) => {
    set({ error });
  },
}));
