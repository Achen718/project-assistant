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
  AnalyzerProjectContext,
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

export {
  processChat,
  processChatStream,
  createSystemPrompt,
  createSystemPromptWithContext,
} from '../src/lib/ai/server';
export { createAssistantChain } from '../src/lib/ai/chains';
export { generateContextAwareResponse } from '../src/lib/ai/context-adapter';

export type {
  CodingConvention,
  PackageJson,
  TSConfig,
  NextConfig,
} from '../src/lib/analyzer';
export {
  analyzePackageJson,
  analyzeFileStructure,
  analyzeCodeQuality,
} from '../src/lib/analyzer';

export { getProjectContextById } from '../src/lib/analyzer/context-storage';

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
