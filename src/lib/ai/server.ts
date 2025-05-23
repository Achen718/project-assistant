import { createAssistantChain } from './chains';
import { streamText, type Message, type StreamTextResult } from 'ai';
// import { openai } from '@ai-sdk/openai'; // Comment out OpenAI for now
import { groq } from '@ai-sdk/groq'; // Uncomment Groq
import type { ProjectContext } from '@/lib/context/types';
import { generateContextAwareResponse } from './context-adapter';
import { getProjectContext } from '@/lib/firebase/context-service';
import { generateEmbedding } from './embedding-utils'; // For RAG query
import { searchSimilarEmbeddings } from '../rag/supabase-embedding-service'; // For RAG retrieval
import { SearchResult } from '../rag/types'; // Corrected import type

// console.log(
//   'SERVER.TS: OPENAI_API_KEY from env:',
//   process.env.OPENAI_API_KEY
//     ? process.env.OPENAI_API_KEY.substring(0, 5) + '...'
//     : 'NOT SET'
// ); // Log a snippet or "NOT SET"

// const openaiApiKey = process.env.OPENAI_API_KEY;
// if (!openaiApiKey) {
//   console.warn(
//     'OPENAI_API_KEY is not set. AI features may be limited. Using fallback model.'
//   );
// }
// // Use GPT-3.5-turbo if key is missing, assuming it's more permissive or for testing
// // const openaiModel = openai(openaiApiKey ? 'gpt-4o' : 'gpt-3.5-turbo');
// const openaiModel = openai(openaiApiKey ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo'); // Forcing 3.5-turbo for testing

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.warn('GROQ_API_KEY is not set. Groq features will be unavailable.');
}
// Default to llama3-8b-8192 or another model you prefer from Groq
// Ensure the model name is valid for the Groq provider
const activeModel = groqApiKey ? groq('llama3-8b-8192') : null;

export async function processChat(
  message: string,
  history: Message[] = [],
  appContext?: string,
  projectId?: string,
  userId?: string
): Promise<string> {
  console.log('[processChat] Entered');
  console.log(`[processChat] Received userId: ${userId}`);
  try {
    if (projectId) {
      const projectContextData = await getProjectContext(projectId);
      const responseText = await generateContextAwareResponse(
        message,
        history,
        projectContextData
      );
      console.log(
        '[processChat] Handled by projectId logic, response:',
        responseText
      );
      return responseText;
    }

    const systemPrompt = createSystemPrompt(appContext);
    console.log(
      '[processChat] Creating assistant chain with Groq preference...'
    );
    const chain = createAssistantChain(systemPrompt);

    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'human' : 'assistant',
      content: msg.content,
    }));

    console.log('[processChat] Invoking Langchain chain...');
    const response = await chain.invoke({
      input: message,
      chat_history: formattedHistory,
    });
    console.log(
      '[processChat] Langchain chain invocation successful. Response content:',
      response.content
    );
    return response.content as string;
  } catch (error) {
    console.error(
      '[processChat] Error during Langchain chain invocation or projectId logic:',
      error
    );
    console.log('[processChat] Re-throwing error from catch block.');
    throw error; // Re-throw the error to be caught by the API route handler
    // return 'Sorry, there was an error processing your request.';
  }
}

export async function processChatStream(
  messageContent: string,
  history: Message[] = [],
  appContext?: string,
  projectContextInput?: ProjectContext,
  userId?: string
): Promise<Response> {
  if (!activeModel) {
    console.error('Groq API key not configured. Cannot process stream.');
    return new Response(
      JSON.stringify({
        error: 'AI service not configured',
        details: 'Groq API key is missing.',
      }),
      {
        status: 503, // Service Unavailable
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let systemPrompt = '';
  let augmentedMessageContent = messageContent;

  // RAG - Retrieve context from Supabase if projectId and userId are available
  if (projectContextInput?.projectId && userId) {
    console.log(
      `[processChatStream] RAG: Attempting to retrieve context for project: ${projectContextInput.projectId}, user: ${userId}`
    );
    try {
      const queryEmbedding = await generateEmbedding(messageContent);
      if (queryEmbedding) {
        const similarChunks: SearchResult[] = await searchSimilarEmbeddings(
          projectContextInput.projectId,
          userId,
          queryEmbedding,
          0.75, // match_threshold - adjust as needed
          5 // match_count - adjust as needed
        );
        if (similarChunks && similarChunks.length > 0) {
          let ragContext =
            '\n\n--- Retrieved Context from Codebase (Use this to answer the query): ---\n';
          similarChunks.forEach((chunk, index) => {
            ragContext += `Snippet ${index + 1} (from file ${
              chunk.file_path
            }, lines ~${chunk.start_char_offset}-${chunk.end_char_offset}):
\`\`\`
${chunk.chunk_text}
\`\`\`
---\n`;
          });
          augmentedMessageContent = `${messageContent}\n${ragContext}`;
          console.log(
            '[processChatStream] RAG: Successfully retrieved and prepended context to message.'
          );
        } else {
          console.log(
            '[processChatStream] RAG: No similar chunks found or an error occurred during search.'
          );
        }
      } else {
        console.warn(
          '[processChatStream] RAG: Could not generate embedding for user query.'
        );
      }
    } catch (ragError) {
      console.error(
        '[processChatStream] RAG: Error during context retrieval:',
        ragError
      );
      // Proceed without RAG context if an error occurs
    }
  }

  if (projectContextInput) {
    try {
      systemPrompt = createSystemPromptWithContext(
        appContext,
        projectContextInput
      );
    } catch (error) {
      console.error('Error creating system prompt with context:', error);
      systemPrompt = createSystemPrompt(appContext);
    }
  } else {
    systemPrompt = createSystemPrompt(appContext);
  }

  const formattedMessages: Message[] = [
    { id: crypto.randomUUID(), role: 'system', content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: 'user', content: augmentedMessageContent },
  ];

  try {
    const result: StreamTextResult<never, string> = await streamText({
      model: activeModel, // Use activeModel (Groq)
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Linter consistently rejects .toResponse(). Using fallback to textStream.
    if (result.textStream && result.textStream instanceof ReadableStream) {
      return new Response(result.textStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }, // Standard headers for text stream
      });
    } else {
      console.error(
        'AI streaming error: textStream not available or not a ReadableStream on streamText result.',
        result
      );
      return new Response(
        JSON.stringify({
          error: 'Failed to process AI stream request',
          details: 'textStream not available or invalid',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: unknown) {
    console.error('AI streaming error:', error);
    let errorMessage = 'Unknown streaming error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI stream request',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Creates a basic system prompt based on application context
 */
export function createSystemPrompt(appContext?: string): string {
  let basePrompt = appContext
    ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.`
    : 'You are a helpful AI assistant.';

  basePrompt += `\nWhen responding, if the user's message contains "Retrieved Context from Codebase", please use that information as the primary source for your answer. If the retrieved context is not relevant or insufficient, use your general knowledge.`;
  return basePrompt;
}

/**
 * Creates a detailed system prompt that incorporates project context
 */
export function createSystemPromptWithContext(
  appContext?: string,
  projectContext?: ProjectContext
): string {
  let prompt = createSystemPrompt(appContext);

  prompt += `\nIn addition to any retrieved codebase snippets, consider the following general project details. Synthesize all available information for the most comprehensive answer.`;

  if (!projectContext) {
    prompt += '\nNo general project details available for this session.';
    return prompt;
  }

  prompt += `\n\nGeneral Project Details:`;

  if (projectContext.technologies && projectContext.technologies.length > 0) {
    prompt += '\nProject Technologies:';
    prompt += `\n${projectContext.technologies.map((t) => t.name).join(', ')}`;
  }

  if (projectContext.frameworks && projectContext.frameworks.length > 0) {
    prompt += '\nFrameworks:';
    prompt += `\n${projectContext.frameworks.map((f) => f.name).join(', ')}`;
  }

  if (
    projectContext.architecturalPatterns &&
    projectContext.architecturalPatterns.length > 0
  ) {
    prompt += '\nArchitecture:';
    prompt += `\n${projectContext.architecturalPatterns
      .map((p) => p.name)
      .join(', ')}`;
  }

  if (projectContext.codePatterns && projectContext.codePatterns.length > 0) {
    prompt += '\nCode Patterns:';
    for (const pattern of projectContext.codePatterns) {
      prompt += `\n- ${pattern.name}: ${pattern.description}`;
    }
  }

  if (
    projectContext.bestPracticesObserved &&
    projectContext.bestPracticesObserved.length > 0
  ) {
    prompt += '\nBest Practices Observed:';
    for (const practice of projectContext.bestPracticesObserved) {
      prompt += `\n- ${practice}`;
    }
  }

  prompt += `\n\nWhen answering questions about this project:
1. Prioritize information from any "Retrieved Context from Codebase" in the user's message.
2. Supplement with these "General Project Details" (technologies, patterns, etc.) for broader understanding.
3. If conflicting, explicitly state the source of your information.
4. Suggest solutions that align with the existing codebase and its established patterns.
5. Use code examples that match the project's style if possible.`;

  return prompt;
}
