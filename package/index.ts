// Re-export all the components and types
export { default as AIChatComponent } from '../components/chat/AIChatComponent';
export { default as MessageList } from '../components/chat/MessageList';
export { default as MessageItem } from '../components/chat/MessageItem';
export { default as ChatInput } from '../components/chat/ChatInput';

// Export client functions
export { createAIAssistant } from '../client-lib/ai-assistant-client';
export type { AIAssistantClientOptions } from '../client-lib/ai-assistant-client';

// Export types
export type { Message, ChatSession } from '../lib/types';

// Export analyzer
export { analyzeProject } from '../lib/analyzer';
export type {
  ProjectContext,
  Technology,
  CodePattern,
  ArchitecturalPattern,
  AnalyzerResult,
} from '../lib/analyzer';
