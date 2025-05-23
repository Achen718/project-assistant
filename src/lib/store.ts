import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from 'ai';
import {
  createChatSession,
  updateChatSession,
  getUserChatSessions,
  deleteChatSession,
  addMessageToSession,
  getSessionMessages,
} from './firestore-service';

export const DEV_USER_ID = 'dev-user-123';

// Update ChatSession to use AI SDK Message type
interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

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
  addMessage: (
    content: string,
    role: 'user' | 'assistant' | 'system'
  ) => Promise<void>;

  // UI state
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  loading: false,
  error: null,
  userId: DEV_USER_ID,

  setUserId: (userId) => {
    // Allow manual override but fall back to dev ID if null is passed
    set({ userId: userId || DEV_USER_ID });
    get().fetchSessions();
  },

  fetchSessions: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ loading: true });

    try {
      const sessions = await getUserChatSessions(userId);
      // Convert sessions to match the store's ChatSession interface with ai SDK Message type
      const convertedSessions: ChatSession[] = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        messages: session.messages.map((msg) => ({
          id: msg.id,
          content: msg.content || '',
          role: msg.role || 'user',
          createdAt: msg.createdAt,
        })),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
      set({ sessions: convertedSessions });

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

  // Updated to use AI SDK Message format directly
  addMessage: async (
    content: string,
    role: 'user' | 'assistant' | 'system'
  ) => {
    const { currentSessionId, userId } = get();
    if (!currentSessionId || !userId) return;

    const timestamp = Date.now();

    try {
      // Create message in AI SDK format
      const message: Message = {
        id: uuidv4(),
        role,
        content,
        // Convert timestamp to Date object as required by Message type
        createdAt: new Date(timestamp),
      };

      // Add to Firestore (you'll need to update this function to accept AI SDK format)
      const messageId = await addMessageToSession(currentSessionId, message);

      // Update id if Firestore generated a new one
      message.id = messageId || message.id;

      // Update local state
      set((state) => {
        const currentSession = state.sessions.find(
          (s) => s.id === currentSessionId
        );

        // Update session title if this is the first user message
        let title = currentSession?.title || 'New Chat';
        if (currentSession?.messages.length === 0 && role === 'user') {
          title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
          // Update title in Firestore
          updateChatSession(currentSessionId, { title });
        }

        return {
          sessions: state.sessions.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  title,
                  messages: [...(session.messages || []), message],
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
