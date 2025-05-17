interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
declare const ChatInput: ({ onSendMessage, disabled, placeholder, }: ChatInputProps) => import("react/jsx-runtime").JSX.Element;
export default ChatInput;
