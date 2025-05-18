import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ProjectContext } from '@/lib/context/types';
import { type Message as ChatMessage } from 'ai';

/**
 * Context adapter that enhances AI responses with project context
 */
export async function generateContextAwareResponse(
  message: string,
  history: ChatMessage[],
  context: ProjectContext | null,
  config?: {
    streaming?: boolean;
    apiKey?: string;
    model?: string;
  }
): Promise<string> {
  const llm = new ChatOpenAI({
    modelName: config?.model || 'gpt-4o-mini',
    temperature: 0.7,
    streaming: config?.streaming || false,
    openAIApiKey: config?.apiKey || process.env.OPENAI_API_KEY,
  });

  // First, assess if the context is relevant to the query
  const relevanceScore = await assessContextRelevance(message, context, llm);

  // Generate response based on relevance score
  if (relevanceScore > 3 && context) {
    return generateEnhancedResponse(message, context, llm);
  } else {
    return generateStandardResponse(message, llm);
  }
}

/**
 * Assess how relevant the project context is to the user query
 */
async function assessContextRelevance(
  query: string,
  context: ProjectContext | null,
  llm: ChatOpenAI
): Promise<number> {
  if (!context) {
    return 0;
  }

  const contextSummary = formatContextSummary(context);

  const contextAssessmentPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an expert at determining how relevant project context is to user queries. ' +
        'Analyze the provided project context and determine how relevant it is to answering the user query. ' +
        'Assign a relevance score from 0 (completely irrelevant) to 10 (highly relevant).'
    ),
    new HumanMessage(
      `Project Context: ${contextSummary}\n\nUser Query: ${query}\n\n` +
        'Assess the relevance of this context to the query on a scale of 0-10 and explain why briefly.'
    ),
  ]);

  const assessment = await contextAssessmentPrompt.pipe(llm).invoke({});

  // Extract the score from the response (assuming it contains a number 0-10)
  const responseText = assessment.content.toString();
  const relevanceMatch = responseText.match(/\b([0-9]|10)\b/);
  return relevanceMatch ? parseInt(relevanceMatch[0], 10) : 5;
}

/**
 * Generate a response enhanced with project context
 */
async function generateEnhancedResponse(
  query: string,
  context: ProjectContext,
  llm: ChatOpenAI
): Promise<string> {
  const contextString = formatContextSummary(context);

  const contextEnhancedPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an AI assistant with expertise in software development. ' +
        "Use the provided project context to tailor your response to be more relevant and specific to the user's project. " +
        'Focus particularly on technology choices, architectural patterns, and coding conventions ' +
        'that match the context provided.\n\n' +
        `${contextString}`
    ),
    new HumanMessage(query),
  ]);

  const response = await contextEnhancedPrompt.pipe(llm).invoke({});
  return response.content.toString();
}

/**
 * Generate a standard response without project context
 */
async function generateStandardResponse(
  query: string,
  llm: ChatOpenAI
): Promise<string> {
  const standardPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an AI assistant with expertise in software development. ' +
        "Provide a helpful answer to the user's query."
    ),
    new HumanMessage(query),
  ]);

  const response = await standardPrompt.pipe(llm).invoke({});
  return response.content.toString();
}

/**
 * Format project context into a string summary
 */
function formatContextSummary(context: ProjectContext): string {
  const {
    technologies,
    frameworks,
    architecture,
    codePatterns,
    bestPractices,
  } = context;

  return `
PROJECT CONTEXT SUMMARY:
- Technologies: ${technologies?.join(', ') || 'N/A'}
- Frameworks: ${frameworks?.join(', ') || 'N/A'}
- Architecture: ${architecture?.join(', ') || 'N/A'}
- Code Patterns: ${codePatterns?.map((p) => p.name).join(', ') || 'N/A'}
- Best Practices: ${bestPractices?.slice(0, 3).join(', ') || 'N/A'}
`;
}
