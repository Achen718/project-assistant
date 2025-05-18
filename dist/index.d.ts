import * as react_jsx_runtime from 'react/jsx-runtime';
import { Message as Message$1 } from 'ai';

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

interface Technology {
    name: string;
    version?: string;
    type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
    usage?: 'core' | 'development' | 'optional';
}
interface CodePattern {
    name: string;
    description: string;
    examples: string[];
    locations: string[];
}
interface ArchitecturalPattern {
    name: string;
    description: string;
    components: string[];
    locations: string[];
}
interface ProjectContext {
    name: string;
    technologies: Technology[];
    patterns: {
        code: CodePattern[];
        architectural: ArchitecturalPattern[];
    };
    fileStructure: {
        directories: string[];
        entryPoints: string[];
        configFiles: string[];
    };
    metadata: {
        analyzedAt: Date;
        confidence: number;
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
    context: ProjectContext;
    raw: {
        packageJson?: PackageJson;
        tsConfig?: TSConfig;
        nextConfig?: NextConfig;
        otherConfigs: Record<string, unknown>;
    };
}

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
    context: ProjectContext;
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
        context: ProjectContext;
        contextId: string;
    }>;
    getUserProjects: () => Promise<StoredProjectContext[]>;
    getProjectContext: (contextId: string) => Promise<StoredProjectContext>;
    deleteProjectContext: (contextId: string) => Promise<void>;
};

export { type AIAssistantClientOptions, AIChatComponent, type AnalyzerResult, type ArchitecturalPattern, ChatInput, type ChatSession, type CodePattern, type Message, MessageItem, MessageList, type ProjectContext, type StoredProjectContext, type Technology, analyzeProject, createAIAssistant, deleteProjectContext, getLatestProjectContext, getUserProjects, storeProjectContext };
