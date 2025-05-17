import { Message } from '@/lib/types';
interface ChatContainerProps {
    messages: Message[];
    loading: boolean;
    onSendMessage: (message: string) => void;
}
declare const ChatContainer: ({ messages, loading, onSendMessage, }: ChatContainerProps) => import("react/jsx-runtime").JSX.Element;
export default ChatContainer;
