import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '@/lib/types';
import { AnalyzerProjectContext as ProjectContext } from '@/lib/analyzer';
import { StoredProjectContext } from '@/lib/analyzer/context-storage';

export interface AIAssistantClientOptions {
  apiUrl: string;
  appContext?: string;
  getIdToken?: () => Promise<string | null>; // For Firebase ID tokens
  staticApiKey?: string; // For fallback or non-user-specific auth
}

export function createAIAssistant(options: AIAssistantClientOptions) {
  // Initialize configuration
  const apiUrl = options.apiUrl.endsWith('/')
    ? options.apiUrl.slice(0, -1)
    : options.apiUrl;
  const appContext = options.appContext;
  const getIdToken = options.getIdToken;
  const staticApiKey = options.staticApiKey;

  // Private utility function
  const fetchWithAuth = async (
    endpoint: string,
    requestOptions?: RequestInit
  ) => {
    const url = `${apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((requestOptions?.headers as Record<string, string>) || {}),
    };

    let tokenToUse: string | null = null;
    if (getIdToken) {
      tokenToUse = await getIdToken();
    }

    if (tokenToUse) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    } else if (staticApiKey) {
      headers['Authorization'] = `Bearer ${staticApiKey}`;
    }
    // If no token and no staticApiKey, the request will be made without an Authorization header.
    // Server should handle this (e.g., reject if auth is required).

    return fetch(url, {
      ...requestOptions,
      headers,
    });
  };

  // Return the client interface
  return {
    // Send a message to the AI assistant
    sendMessage: async (
      message: string,
      history: Message[] = [],
      contextId?: string
    ): Promise<Message> => {
      const response = await fetchWithAuth('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message,
          history,
          contextId,
          streaming: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        id: data.id || uuidv4(),
        role: 'assistant',
        content: data.response || data.content,
        createdAt: data.timestamp || Date.now(),
      };
    },

    getSessions: async (): Promise<ChatSession[]> => {
      const response = await fetchWithAuth('/api/sessions');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.sessions;
    },

    createSession: async (
      title?: string,
      contextId?: string
    ): Promise<ChatSession> => {
      const response = await fetchWithAuth('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ title, contextId }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    getSessionMessages: async (sessionId: string): Promise<Message[]> => {
      const response = await fetchWithAuth(
        `/api/sessions/${sessionId}/messages`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    },

    sendMessageToSession: async (
      sessionId: string,
      content: string
    ): Promise<{
      userMessage: Message;
      aiMessage: Message;
    }> => {
      const response = await fetchWithAuth(
        `/api/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    updateSession: async (
      sessionId: string,
      data: Partial<ChatSession & { contextId?: string }>
    ): Promise<void> => {
      const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },

    deleteSession: async (sessionId: string): Promise<void> => {
      const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },

    // streaming method
    streamMessage: async (
      message: string,
      history: Message[] = [],
      onChunk: (chunk: string) => void,
      contextId?: string
    ): Promise<Message> => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (appContext) {
        headers['x-app-context'] = appContext;
      }

      // Ensure token is included for streaming if getIdToken is available
      let tokenToUse: string | null = null;
      if (getIdToken) {
        tokenToUse = await getIdToken();
      }
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
      } else if (staticApiKey) {
        headers['Authorization'] = `Bearer ${staticApiKey}`;
      }

      const response = await fetch(`${apiUrl}/api/assistant`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          history,
          streaming: true,
          contextId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      let fullText = '';

      // Create decoder for stream
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;
          onChunk(chunk);
        }
      } finally {
        reader.releaseLock();
      }

      // Return complete message
      return {
        id: uuidv4(),
        role: 'assistant',
        content: fullText,
        createdAt: new Date(),
      };
    },

    // Project analysis
    analyzeProject: async (
      projectPath: string
    ): Promise<{
      context: ProjectContext;
      contextId: string;
    }> => {
      const response = await fetchWithAuth('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ projectPath }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        context: data.analysis.context,
        contextId: data.contextId,
      };
    },

    // Project context management
    getUserProjects: async (): Promise<StoredProjectContext[]> => {
      const response = await fetchWithAuth('/api/projects');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.projects;
    },

    getProjectContext: async (
      contextId: string
    ): Promise<StoredProjectContext> => {
      if (
        !contextId ||
        typeof contextId !== 'string' ||
        contextId.trim() === ''
      ) {
        console.error(
          'Invalid contextId provided to getProjectContext:',
          contextId
        );
        throw new Error('Invalid or missing project context ID.');
      }
      const response = await fetchWithAuth(`/api/projects/${contextId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    deleteProjectContext: async (contextId: string): Promise<void> => {
      if (
        !contextId ||
        typeof contextId !== 'string' ||
        contextId.trim() === ''
      ) {
        console.error(
          'Invalid contextId provided to deleteProjectContext:',
          contextId
        );
        throw new Error('Invalid or missing project context ID for deletion.');
      }
      const response = await fetchWithAuth(`/api/projects/${contextId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },

    createProjectContext: async (
      projectContext: ProjectContext
    ): Promise<StoredProjectContext> => {
      const response = await fetchWithAuth('/api/context', {
        method: 'POST',
        body: JSON.stringify(projectContext),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },

    // Method to get project context by project ID (which is the contextId in this client)
    getProjectContextByProjectId: async (
      projectId: string
    ): Promise<StoredProjectContext | null> => {
      if (
        !projectId ||
        typeof projectId !== 'string' ||
        projectId.trim() === ''
      ) {
        console.error(
          'Invalid projectId provided to getProjectContextByProjectId:',
          projectId
        );
        throw new Error('Invalid or missing project ID.');
      }
      // This maps to the /api/projects/[id] route on the server
      const response = await fetchWithAuth(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
  };
}

// Export types if needed elsewhere
export type { Message, ChatSession };
export type { ProjectContext, StoredProjectContext };

// Example of how the client might be initialized in an application:
//
// import { createAIAssistant } from './ai-assistant-client';
// import { useAuth } from './auth-provider'; // Assuming a hook that provides getIdToken
//
// const apiClient = createAIAssistant({
//   apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // Ensure this doesn't end with /api
//   appContext: 'my-chat-app',
//   getIdToken: () => { /* logic to get firebase id token */ return Promise.resolve(null); }
// });
//
// Now you can use apiClient.sendMessage(...), apiClient.getSessions(...), etc.
