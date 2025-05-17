import { Message } from '@/lib/types';
interface MessageListProps {
    messages: Message[];
    loading?: boolean;
}
declare const MessageList: ({ messages, loading }: MessageListProps) => import("react/jsx-runtime").JSX.Element;
export default MessageList;
