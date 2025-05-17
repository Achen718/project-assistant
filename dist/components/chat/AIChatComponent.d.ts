import React from 'react';
import { Message } from '@/lib/types';
export interface AIChatComponentProps {
    apiKey?: string;
    apiEndpoint?: string;
    initialMessages?: Message[];
    placeholder?: string;
    className?: string;
    onMessageSent?: (message: Message) => void;
    onResponseReceived?: (message: Message) => void;
}
declare const AIChatComponent: React.FC<AIChatComponentProps>;
export default AIChatComponent;
