import * as react_jsx_runtime from 'react/jsx-runtime';
import * as ai from 'ai';
import { Message as Message$1 } from 'ai';
import * as _langchain_core_messages from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';

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

interface Technology$1 {
    name: string;
    version?: string;
    type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
    usage?: 'core' | 'development' | 'optional';
    confidence?: number;
}
interface CodePattern$1 {
    name: string;
    description: string;
    examples?: string[];
    locations?: string[];
}
interface ArchitecturalPattern$1 {
    name: string;
    description: string;
    components?: string[];
    locations?: string[];
}
interface CodingConvention$1 {
    name: string;
    description?: string;
    prevalence?: 'high' | 'medium' | 'low' | 'mixed';
    examples?: string[];
}
interface AnalyzerProjectContext {
    projectName?: string;
    technologies?: Technology$1[];
    architecturalPatterns?: ArchitecturalPattern$1[];
    codePatterns?: CodePattern$1[];
    codingConventions?: CodingConvention$1[];
    bestPracticesObserved?: string[];
    fileStructure?: {
        directories?: string[];
        entryPoints?: string[];
        configFiles?: string[];
    };
    analysisMetadata: {
        analyzedAt: Date;
        overallConfidence?: number;
        analyzerVersion?: string;
    };
}
interface PackageJson {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    [key: string]: unknown;
}
interface TSConfig {
    compilerOptions?: {
        target?: string;
        module?: string;
        lib?: string[];
        jsx?: string;
        [key: string]: unknown;
    };
    include?: string[];
    exclude?: string[];
    [key: string]: unknown;
}
interface NextConfig {
    path: string;
    [key: string]: unknown;
}
interface AnalyzerResult {
    context: AnalyzerProjectContext;
    rawFileContents?: {
        packageJson?: PackageJson;
        tsConfig?: TSConfig;
        nextConfig?: NextConfig;
        otherRelevantConfigs?: Record<string, string>;
    };
    errors?: Array<{
        message: string;
        sourceAnalyzer?: string;
    }>;
}

interface PackageAnalyzerResult {
    projectName?: string;
    technologies: Technology$1[];
}
/**
 * Analyzes a package.json file to extract technology information
 */
declare function analyzePackageJson(packageJson: PackageJson): PackageAnalyzerResult;

interface FileStructureAnalyzerResult {
    fileStructure?: {
        directories?: string[];
        commonDirs?: string[];
        entryPoints?: string[];
        configFiles?: string[];
    };
    architecturalPatterns?: ArchitecturalPattern$1[];
    codePatterns?: CodePattern$1[];
}
/**
 * Analyzes the project file structure from a list of all file paths.
 * @param allProjectFiles - Array of file paths, relative to project root.
 * @param rootDir - The root directory path (used for context if needed, but operations should use relative paths from allProjectFiles).
 */
declare function analyzeFileStructure(allProjectFiles: string[]): FileStructureAnalyzerResult;

interface CodeQualityResult {
    patterns: CodePattern$1[];
    bestPractices: {
        name: string;
        detected: boolean;
        details?: string;
    }[];
    metrics: {
        componentCount: number;
        hooksCount: number;
        utilsCount: number;
        apiRoutesCount: number;
    };
}
/**
 * Analyzes code quality and best practices
 */
declare function analyzeCodeQuality(rootDir: string): Promise<CodeQualityResult>;

/**
 * Analyzes a project codebase and extracts contextual information
 */
declare function analyzeProject(projectPath: string): Promise<AnalyzerResult>;

/**
 * The context storage service provides persistence for project analysis results
 */
interface StoredProjectContext {
    id: string;
    projectPath: string;
    projectHash: string;
    userId: string;
    context: AnalyzerProjectContext;
    createdAt: number;
    updatedAt: number;
    version: number;
}
/**
 * Store analysis results in Firestore
 */
declare function storeProjectContext(userId: string, projectPath: string, result: AnalyzerResult): Promise<string>;
/**
 * Get the latest context for a project
 */
declare function getLatestProjectContext(userId: string, projectPath: string): Promise<StoredProjectContext | null>;
/**
 * Get all projects analyzed by a user
 */
declare function getUserProjects(userId: string): Promise<StoredProjectContext[]>;
/**
 * Delete a project context and all its versions
 */
declare function deleteProjectContext(userId: string, projectPath: string): Promise<void>;
/**
 * Admin function to get project context by ID
 * This is useful for API routes where the user ID might be coming from auth
 */
declare function getProjectContextById(contextId: string): Promise<StoredProjectContext | null>;

interface AIAssistantClientOptions {
    apiUrl: string;
    apiKey: string;
    appContext?: string;
}
declare function createAIAssistant(options: AIAssistantClientOptions): {
    sendMessage: (message: string, history?: Message[], contextId?: string) => Promise<Message>;
    getSessions: () => Promise<ChatSession[]>;
    createSession: (title?: string, contextId?: string) => Promise<ChatSession>;
    getSessionMessages: (sessionId: string) => Promise<Message[]>;
    sendMessageToSession: (sessionId: string, content: string) => Promise<{
        userMessage: Message;
        aiMessage: Message;
    }>;
    updateSession: (sessionId: string, data: Partial<ChatSession & {
        contextId?: string;
    }>) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    streamMessage: (message: string, history: Message[] | undefined, onChunk: (chunk: string) => void, contextId?: string) => Promise<Message>;
    analyzeProject: (projectPath: string) => Promise<{
        context: AnalyzerProjectContext;
        contextId: string;
    }>;
    getUserProjects: () => Promise<StoredProjectContext[]>;
    getProjectContext: (contextId: string) => Promise<StoredProjectContext>;
    deleteProjectContext: (contextId: string) => Promise<void>;
};

/**
 * Technology stack entry with name and confidence level
 */
interface Technology {
    name: string;
    version?: string;
    type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
    confidence?: number;
}
/**
 * Code pattern identified in the project
 */
interface CodePattern {
    name: string;
    description: string;
    examples?: string[];
    locations?: string[];
}
/**
 * Architectural pattern identified in the project
 */
interface ArchitecturalPattern {
    name: string;
    description: string;
    components?: string[];
    locations?: string[];
}
/**
 * Coding convention identified in the project
 */
interface CodingConvention {
    name: string;
    description?: string;
    prevalence?: 'high' | 'medium' | 'low' | 'mixed';
    examples?: string[];
}
/**
 * User preference value
 */
interface UserPreferenceValue {
    value: string | number | boolean;
    source?: 'explicit' | 'inferred';
}
/**
 * User preferences
 */
interface UserPreferences {
    [preferenceKey: string]: UserPreferenceValue;
}
/**
 * Structure representing analyzed project context information (Stored Version)
 */
interface ProjectContext {
    projectId: string;
    projectName?: string;
    technologies?: Technology[];
    frameworks?: Technology[];
    architecturalPatterns?: ArchitecturalPattern[];
    codePatterns?: CodePattern[];
    codingConventions?: CodingConvention[];
    fileStructureSummary?: {
        mainEntryPoints?: string[];
        commonDirectories?: string[];
        recognizedConfigFiles?: string[];
    };
    bestPracticesObserved?: string[];
    userPreferences?: UserPreferences;
    lastAnalyzed: string;
}
/**
 * Result of a project analysis operation, as returned by an API endpoint
 * (This links the stored ProjectContext to an ID and timestamp)
 */
interface StoredAnalysisResult {
    projectId: string;
    context: ProjectContext;
    analysisTimestamp: number;
    storageTimestamp?: number;
}

declare function processChat(message: string, history?: Message$1[], appContext?: string, projectId?: string): Promise<_langchain_core_messages.MessageContent>;
declare function processChatStream(message: string, // This is potentially augmentedMessage from the API route
history?: Message$1[], appContext?: string, projectContextInput?: ProjectContext): Promise<Response | ai.StreamTextResult<ai.ToolSet, never>>;
/**
 * Creates a basic system prompt based on application context
 */
declare function createSystemPrompt(appContext?: string): string;
/**
 * Creates a detailed system prompt that incorporates project context
 */
declare function createSystemPromptWithContext(appContext?: string, projectContext?: ProjectContext): string;

declare function createAssistantChain(systemPrompt: string, modelName?: string, apiKey?: string): RunnableSequence<any, _langchain_core_messages.AIMessageChunk>;

/**
 * Context adapter that enhances AI responses with project context
 */
declare function generateContextAwareResponse(message: string, history: Message$1[], context: ProjectContext | null, config?: {
    streaming?: boolean;
    apiKey?: string;
    model?: string;
}): Promise<string>;

export { type AIAssistantClientOptions, AIChatComponent, type AnalyzerProjectContext, type AnalyzerResult, type ArchitecturalPattern$1 as ArchitecturalPattern, ChatInput, type ChatSession, type CodePattern$1 as CodePattern, type CodingConvention$1 as CodingConvention, type ArchitecturalPattern as DomainArchitecturalPattern, type CodePattern as DomainCodePattern, type CodingConvention as DomainCodingConvention, type ProjectContext as DomainProjectContext, type StoredAnalysisResult as DomainStoredAnalysisResult, type Technology as DomainTechnology, type Message, MessageItem, MessageList, type NextConfig, type PackageJson, type StoredProjectContext, type TSConfig, type Technology$1 as Technology, type UserPreferenceValue, type UserPreferences, analyzeCodeQuality, analyzeFileStructure, analyzePackageJson, analyzeProject, createAIAssistant, createAssistantChain, createSystemPrompt, createSystemPromptWithContext, deleteProjectContext, generateContextAwareResponse, getLatestProjectContext, getProjectContextById, getUserProjects, processChat, processChatStream, storeProjectContext };
