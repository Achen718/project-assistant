// Re-export all the components and types
export { default as AIChatComponent } from '../src/components/chat/AIChatComponent';
export { default as MessageList } from '../src/components/chat/MessageList';
export { default as MessageItem } from '../src/components/chat/MessageItem';
export { default as ChatInput } from '../src/components/chat/ChatInput';

// Export client functions
export { createAIAssistant } from '../src/client-lib/ai-assistant-client';
export type { AIAssistantClientOptions } from '../src/client-lib/ai-assistant-client';

// Export types
export type { Message, ChatSession } from '../src/lib/types';

// Export analyzer
export { analyzeProject } from '../src/lib/analyzer';
export type {
  ProjectContext,
  Technology,
  CodePattern,
  ArchitecturalPattern,
  AnalyzerResult,
} from '../src/lib/analyzer';

// Export context storage
export {
  storeProjectContext,
  getLatestProjectContext,
  getUserProjects,
  deleteProjectContext,
} from '../src/lib/analyzer/context-storage';
export type { StoredProjectContext } from '../src/lib/analyzer/context-storage';
