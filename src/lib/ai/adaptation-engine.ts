import { type Message } from 'ai';
import { ProjectContext } from '@/lib/context/types';
import { getProjectContext } from '@/lib/firebase/context-service';

/**
 * Enhances AI prompts with project-specific context
 */
export async function enhancePromptWithContext(
  message: string,
  history: Message[],
  projectId?: string
): Promise<{ enhancedPrompt: string; context: ProjectContext | null }> {
  // If no projectId is provided, return the original message
  if (!projectId) {
    return { enhancedPrompt: message, context: null };
  }

  try {
    // Retrieve project context from Firebase
    const context = await getProjectContext(projectId);

    if (!context) {
      return { enhancedPrompt: message, context: null };
    }

    // Create a context-enhanced prompt
    const contextString = formatContextForPrompt(context);
    const enhancedPrompt = `${contextString} Original request: ${message}`;

    return { enhancedPrompt, context };
  } catch (error) {
    console.error('Error enhancing prompt with context:', error);
    return { enhancedPrompt: message, context: null };
  }
}

/**
 * Formats project context data into a string for AI prompt enhancement
 */
function formatContextForPrompt(context: ProjectContext): string {
  const {
    technologies,
    frameworks,
    architecture,
    codePatterns,
    bestPractices,
  } = context;

  return `
# PROJECT CONTEXT INFORMATION
Use this context to tailor your response to this specific project.

## Technology Stack
${technologies?.join(', ') || 'Not specified'}

## Frameworks
${frameworks?.join(', ') || 'Not specified'}

## Architecture
${architecture?.join(', ') || 'Not specified'}

## Code Patterns
${
  codePatterns
    ?.map((pattern) => `- ${pattern.name}: ${pattern.description}`)
    .join('\n') || 'Not specified'
}

## Best Practices
${
  bestPractices?.map((practice) => `- ${practice}`).join('\n') ||
  'Not specified'
}
`;
}
