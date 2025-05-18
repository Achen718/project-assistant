import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END, START } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
} from '@langchain/core/messages';
import { ProjectContext } from '@/lib/context/types';

// Define the state interface for our reasoning graph
interface ContextReasoningState {
  messages: BaseMessage[];
  context?: ProjectContext | null;
  contextRelevance?: number;
}

/**
 * Creates a reasoning graph for context-aware AI responses
 */
export function createContextAwareReasoningGraph(config?: {
  streaming?: boolean;
  apiKey?: string;
  model?: string;
}) {
  // Initialize the LLM
  const llm = new ChatOpenAI({
    modelName: config?.model || 'gpt-4o-mini',
    temperature: 0.7,
    streaming: config?.streaming || false,
    openAIApiKey: config?.apiKey || process.env.OPENAI_API_KEY,
  });

  // Create the context assessment prompt
  const contextAssessmentPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an expert at determining how relevant project context is to user queries. ' +
        'Analyze the provided project context and determine how relevant it is to answering the user query. ' +
        'Assign a relevance score from 0 (completely irrelevant) to 10 (highly relevant).'
    ),
    new HumanMessage(
      'Project Context: {context}\n\nUser Query: {query}\n\n' +
        'Assess the relevance of this context to the query on a scale of 0-10 and explain why briefly.'
    ),
  ]);

  // Create the context-enhanced response prompt
  const contextEnhancedPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an AI assistant with expertise in software development. ' +
        "Use the provided project context to tailor your response to be more relevant and specific to the user's project. " +
        'Focus particularly on technology choices, architectural patterns, and coding conventions ' +
        'that match the context provided.'
    ),
    new HumanMessage('{query}'),
  ]);

  // Create the standard response prompt without context
  const standardPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      'You are an AI assistant with expertise in software development. ' +
        "Provide a general answer to the user's query."
    ),
    new HumanMessage('{query}'),
  ]);

  // Define the nodes for our graph
  const assessContext = async (
    state: ContextReasoningState,
    config?: RunnableConfig
  ) => {
    // If no context is available, skip assessment
    if (!state.context) {
      return { ...state, contextRelevance: 0 };
    }

    const latestMessage = state.messages[state.messages.length - 1];
    const userQuery = latestMessage.content as string;

    // Format context into a string summary
    const contextSummary = formatContextSummary(state.context);

    // Assess context relevance
    const assessment = await contextAssessmentPrompt.pipe(llm).invoke(
      {
        context: contextSummary,
        query: userQuery,
      },
      config
    );

    // Extract the relevance score from the response (assuming it contains a number 0-10)
    const responseText = assessment.content as string;
    const relevanceMatch = responseText.match(/\b([0-9]|10)\b/);
    const relevanceScore = relevanceMatch ? parseInt(relevanceMatch[0], 10) : 5;

    // Return only the update for the contextRelevance channel
    return { contextRelevance: relevanceScore };
  };

  const generateResponse = async (
    state: ContextReasoningState,
    config?: RunnableConfig
  ) => {
    const latestMessage = state.messages[state.messages.length - 1];
    const userQuery = latestMessage.content as string;

    // Choose prompt based on context relevance
    let response;
    if (state.contextRelevance && state.contextRelevance > 3 && state.context) {
      // Use context-enhanced prompt for relevant context
      const contextString = formatContextSummary(state.context);
      response = await contextEnhancedPrompt.pipe(llm).invoke(
        {
          query: userQuery,
          context: contextString,
        },
        config
      );
    } else {
      // Use standard prompt for low-relevance or no context
      response = await standardPrompt
        .pipe(llm)
        .invoke({ query: userQuery }, config);
    }

    // Add the AI response to the messages
    // Return only the update for the messages channel
    return {
      messages: [response], // Ensure it's an array for the concat reducer
    };
  };

  // Create the graph
  const workflow = new StateGraph<ContextReasoningState>({
    channels: {
      messages: {
        value: (
          currentMessages: BaseMessage[] = [],
          newMessages: BaseMessage | BaseMessage[]
        ) =>
          currentMessages.concat(
            Array.isArray(newMessages) ? newMessages : [newMessages]
          ),
        default: (): BaseMessage[] => [],
      },
      context: {
        value: (
          _currentContext?: ProjectContext | null,
          newContext?: ProjectContext | null
        ) => newContext,
        default: (): ProjectContext | null => null,
      },
      contextRelevance: {
        value: (_currentRelevance?: number, newRelevance?: number) =>
          newRelevance,
        default: (): number | undefined => undefined,
      },
    },
  })
    .addNode('assessContext', assessContext)
    .addNode('generateResponse', generateResponse)
    .addEdge(START, 'assessContext')
    .addEdge('assessContext', 'generateResponse')
    .addEdge('generateResponse', END);

  // Compile the graph
  const reasoningGraph = workflow.compile();

  return reasoningGraph;
}

/**
 * Formats project context into a string summary for the AI
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
