import { P as PackageJson, T as Technology, A as ArchitecturalPattern, C as CodePattern, a as AnalyzerResult, b as ProjectContext } from './client-Bmw2p12E.mjs';
export { g as AIAssistantClientOptions, c as AIChatComponent, j as AnalyzerProjectContext, e as ChatInput, i as ChatSession, o as CodingConvention, t as DomainArchitecturalPattern, r as DomainCodePattern, u as DomainCodingConvention, w as DomainStoredAnalysisResult, q as DomainTechnology, h as Message, d as MessageItem, M as MessageList, N as NextConfig, S as StoredProjectContext, p as TSConfig, v as UserPreferenceValue, U as UserPreferences, f as createAIAssistant, m as deleteProjectContext, k as getLatestProjectContext, n as getProjectContextById, l as getUserProjects, s as storeProjectContext } from './client-Bmw2p12E.mjs';
import { Message } from 'ai';
import * as _langchain_core_messages from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import 'react/jsx-runtime';

interface PackageAnalyzerResult {
    projectName?: string;
    technologies: Technology[];
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
    architecturalPatterns?: ArchitecturalPattern[];
    codePatterns?: CodePattern[];
}
/**
 * Analyzes the project file structure from a list of all file paths.
 * @param allProjectFiles - Array of file paths, relative to project root.
 * @param rootDir - The root directory path (used for context if needed, but operations should use relative paths from allProjectFiles).
 */
declare function analyzeFileStructure(allProjectFiles: string[]): FileStructureAnalyzerResult;

interface CodeQualityResult {
    patterns: CodePattern[];
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

declare function processChat(message: string, history?: Message[], appContext?: string, projectId?: string): Promise<string>;
declare function processChatStream(messageContent: string, history?: Message[], appContext?: string, projectContextInput?: ProjectContext): Promise<Response>;
/**
 * Creates a basic system prompt based on application context
 */
declare function createSystemPrompt(appContext?: string): string;
/**
 * Creates a detailed system prompt that incorporates project context
 */
declare function createSystemPromptWithContext(appContext?: string, projectContext?: ProjectContext): string;

declare function createAssistantChain(systemPrompt: string, modelName?: string, apiKey?: string, llmOptions?: Record<string, any>): RunnableSequence<any, _langchain_core_messages.AIMessageChunk>;

/**
 * Context adapter that enhances AI responses with project context
 */
declare function generateContextAwareResponse(message: string, history: Message[], context: ProjectContext | null, config?: {
    streaming?: boolean;
    apiKey?: string;
    model?: string;
}): Promise<string>;

export { AnalyzerResult, ArchitecturalPattern, CodePattern, ProjectContext as DomainProjectContext, PackageJson, Technology, analyzeCodeQuality, analyzeFileStructure, analyzePackageJson, analyzeProject, createAssistantChain, createSystemPrompt, createSystemPromptWithContext, generateContextAwareResponse, processChat, processChatStream };
