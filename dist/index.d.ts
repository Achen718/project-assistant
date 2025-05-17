import * as react_jsx_runtime from 'react/jsx-runtime';
import { Message as Message$1 } from 'ai';

type Message = Message$1;
interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

interface AIChatComponentProps {
    apiKey?: string;
    apiEndpoint?: string;
    initialMessages?: Message[];
    placeholder?: string;
    className?: string;
    onMessageSent?: (message: Message) => void;
    onResponseReceived?: (message: Message) => void;
}
declare const AIChatComponent: ({ apiKey, apiEndpoint, initialMessages, placeholder, className, onMessageSent, onResponseReceived, }: AIChatComponentProps) => react_jsx_runtime.JSX.Element;

interface MessageListProps {
    messages: Message[];
    loading?: boolean;
}
declare const MessageList: ({ messages, loading }: MessageListProps) => react_jsx_runtime.JSX.Element;

interface MessageItemProps {
    message: Message;
    isAI: boolean;
}
declare const MessageItem: ({ message, isAI }: MessageItemProps) => react_jsx_runtime.JSX.Element;

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
declare const ChatInput: ({ onSendMessage, disabled, placeholder, }: ChatInputProps) => react_jsx_runtime.JSX.Element;

interface AIAssistantClientOptions {
    apiUrl: string;
    apiKey: string;
    appContext?: string;
}
declare function createAIAssistant(options: AIAssistantClientOptions): {
    sendMessage: (message: string, history?: Message[]) => Promise<Message>;
    getSessions: () => Promise<ChatSession[]>;
    createSession: (title?: string) => Promise<ChatSession>;
    getSessionMessages: (sessionId: string) => Promise<Message[]>;
    sendMessageToSession: (sessionId: string, content: string) => Promise<{
        userMessage: Message;
        aiMessage: Message;
    }>;
    updateSession: (sessionId: string, data: Partial<ChatSession>) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    streamMessage: (message: string, history: Message[] | undefined, onChunk: (chunk: string) => void) => Promise<Message>;
};

export { type AIAssistantClientOptions, AIChatComponent, ChatInput, type ChatSession, type Message, MessageItem, MessageList, createAIAssistant };
