import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from './types';
import {
  createChatSession,
  updateChatSession,
  getUserChatSessions,
  deleteChatSession,
  addMessageToSession,
  getSessionMessages,
} from './firestore-service';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;

  // User management
  setUserId: (userId: string | null) => void;

  // Session management
  fetchSessions: () => Promise<void>;
  createSession: () => Promise<string>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Message management
  addMessage: (text: string, sender: 'user' | 'ai') => Promise<void>;

  // UI state
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  loading: false,
  error: null,
  userId: null,

  setUserId: (userId) => {
    set({ userId });
    if (userId) {
      get().fetchSessions();
    } else {
      set({ sessions: [], currentSessionId: null });
    }
  },

  fetchSessions: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ loading: true });

    try {
      const sessions = await getUserChatSessions(userId);
      set({ sessions });

      // Set current session to the most recent one if none is selected
      if (sessions.length > 0 && !get().currentSessionId) {
        set({ currentSessionId: sessions[0].id });
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      set({ error: 'Failed to load chat sessions' });
    } finally {
      set({ loading: false });
    }
  },

  createSession: async () => {
    const { userId } = get();
    if (!userId) throw new Error('User not authenticated');

    try {
      const sessionId = await createChatSession(userId);

      const newSession: ChatSession = {
        id: sessionId,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: sessionId,
      }));

      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      set({ error: 'Failed to create new chat' });
      throw error;
    }
  },

  switchSession: async (sessionId) => {
    const { sessions } = get();
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      set({ error: 'Chat session not found' });
      return;
    }

    set({ currentSessionId: sessionId, loading: true });

    try {
      // Fetch messages for this session if not already loaded
      if (!session.messages || session.messages.length === 0) {
        const messages = await getSessionMessages(sessionId);

        // Update the session with messages
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages } : s
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ error: 'Failed to load chat messages' });
    } finally {
      set({ loading: false });
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await deleteChatSession(sessionId);

      const { sessions, currentSessionId } = get();
      const newSessions = sessions.filter((s) => s.id !== sessionId);

      // If we're deleting the current session, switch to another one
      let newCurrentSessionId = currentSessionId;
      if (currentSessionId === sessionId) {
        newCurrentSessionId = newSessions.length > 0 ? newSessions[0].id : null;
      }

      set({
        sessions: newSessions,
        currentSessionId: newCurrentSessionId,
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      set({ error: 'Failed to delete chat session' });
    }
  },

  addMessage: async (text, sender) => {
    const { currentSessionId, sessions, userId } = get();
    if (!currentSessionId || !userId) return;

    const timestamp = Date.now();

    try {
      // Add message to Firestore
      const messageId = await addMessageToSession(currentSessionId, {
        text,
        sender,
        timestamp,
      });

      const newMessage: Message = {
        id: messageId,
        text,
        sender,
        timestamp,
      };

      // Update local state
      set((state) => {
        const currentSession = state.sessions.find(
          (s) => s.id === currentSessionId
        );

        // Update session title if this is the first user message
        let title = currentSession?.title || 'New Chat';
        if (currentSession?.messages.length === 0 && sender === 'user') {
          title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
          // Update title in Firestore
          updateChatSession(currentSessionId, { title });
        }

        return {
          sessions: state.sessions.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  title,
                  messages: [...(session.messages || []), newMessage],
                  updatedAt: timestamp,
                }
              : session
          ),
        };
      });
    } catch (error) {
      console.error('Failed to add message:', error);
      set({ error: 'Failed to send message' });
    }
  },

  setLoading: (isLoading) => {
    set({ loading: isLoading });
  },

  setError: (error) => {
    set({ error });
  },
}));
