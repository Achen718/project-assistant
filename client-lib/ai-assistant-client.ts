export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIAssistantClientOptions {
  apiUrl: string;
  apiKey: string;
}

export class AIAssistantClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(options: AIAssistantClientOptions) {
    this.apiUrl = options.apiUrl.endsWith('/')
      ? options.apiUrl.slice(0, -1)
      : options.apiUrl;
    this.apiKey = options.apiKey;
  }

  private async fetchWithAuth(endpoint: string, options?: RequestInit) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Send a message to the AI assistant
  async sendMessage(
    message: string,
    history: Message[] = []
  ): Promise<Message> {
    const response = await this.fetchWithAuth('/assistant', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      text: data.response,
      sender: 'ai',
      timestamp: data.timestamp,
    };
  }

  // Session management
  async getSessions(): Promise<ChatSession[]> {
    const response = await this.fetchWithAuth('/sessions');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.sessions;
  }

  async createSession(title?: string): Promise<ChatSession> {
    const response = await this.fetchWithAuth('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await this.fetchWithAuth(
      `/sessions/${sessionId}/messages`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.messages;
  }

  async sendMessageToSession(
    sessionId: string,
    text: string
  ): Promise<{
    userMessage: Message;
    aiMessage: Message;
  }> {
    const response = await this.fetchWithAuth(
      `/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async updateSession(
    sessionId: string,
    data: Partial<ChatSession>
  ): Promise<void> {
    const response = await this.fetchWithAuth(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  }
}
