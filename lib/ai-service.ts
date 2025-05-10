import axios from 'axios';
import { Message } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || '';
const API_ENDPOINT = process.env.NEXT_PUBLIC_AI_API_ENDPOINT || '';

export async function sendMessageToAI(
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  try {
    // Format conversation history for the API
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add the current user message
    const messages = [
      ...formattedHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      API_ENDPOINT,
      {
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw new Error('Failed to get response from AI service');
  }
}
