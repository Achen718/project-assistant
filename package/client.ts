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

// Export relevant types from analyzer (assuming these types themselves don't import server code)
export type {
  AnalyzerProjectContext,
  Technology,
  CodePattern,
  ArchitecturalPattern,
  AnalyzerResult,
  CodingConvention,
  PackageJson,
  TSConfig,
  NextConfig,
} from '../src/lib/analyzer';

// Export relevant types from context/types (assuming these types themselves don't import server code)
export type {
  ProjectContext as DomainProjectContext,
  Technology as DomainTechnology,
  CodePattern as DomainCodePattern,
  ArchitecturalPattern as DomainArchitecturalPattern,
  CodingConvention as DomainCodingConvention,
  UserPreferences,
  UserPreferenceValue,
  StoredAnalysisResult as DomainStoredAnalysisResult,
} from '../src/lib/context/types';

// StoredProjectContext type IF it doesn't pull server code.
// Let's be cautious and check its definition before uncommenting.
// export type { StoredProjectContext } from '../src/lib/analyzer/context-storage';
