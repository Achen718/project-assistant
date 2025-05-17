import type { Message } from 'ai';
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
    setUserId: (userId: string | null) => void;
    fetchSessions: () => Promise<void>;
    createSession: () => Promise<string>;
    switchSession: (sessionId: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    addMessage: (content: string, role: 'user' | 'assistant' | 'system') => Promise<void>;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}
export declare const useChatStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ChatState>>;
export {};
