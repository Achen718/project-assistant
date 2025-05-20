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
      const response = await fetchWithAuth('/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message,
          history,
          contextId,
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
      const response = await fetchWithAuth('/sessions');

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
      const response = await fetchWithAuth('/sessions', {
        method: 'POST',
        body: JSON.stringify({ title, contextId }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    getSessionMessages: async (sessionId: string): Promise<Message[]> => {
      const response = await fetchWithAuth(`/sessions/${sessionId}/messages`);

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
      const response = await fetchWithAuth(`/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    updateSession: async (
      sessionId: string,
      data: Partial<ChatSession & { contextId?: string }>
    ): Promise<void> => {
      const response = await fetchWithAuth(`/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },

    deleteSession: async (sessionId: string): Promise<void> => {
      const response = await fetchWithAuth(`/sessions/${sessionId}`, {
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

      const response = await fetch(`${apiUrl}/chat`, {
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
      const response = await fetchWithAuth('/analyze', {
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
      const response = await fetchWithAuth('/projects');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.projects;
    },

    getProjectContext: async (
      contextId: string
    ): Promise<StoredProjectContext> => {
      const response = await fetchWithAuth(`/projects/${contextId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    deleteProjectContext: async (contextId: string): Promise<void> => {
      const response = await fetchWithAuth(`/projects/${contextId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
  };
}
