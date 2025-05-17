import { Message } from '@/lib/types';
interface MessageItemProps {
    message: Message;
    isAI: boolean;
}
declare const MessageItem: ({ message, isAI }: MessageItemProps) => import("react/jsx-runtime").JSX.Element;
export default MessageItem;
