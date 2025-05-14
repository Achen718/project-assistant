import { NextRequest } from 'next/server';
import { processChat, processChatStream } from '@/lib/ai/server';

export async function POST(request: NextRequest) {
  try {
    const { message, history, streaming = true } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get app context from headers or body
    const appContext = request.headers.get('x-app-context') || undefined;

    if (streaming) {
      // Return streaming response
      return processChatStream(message, history || [], appContext);
    } else {
      // Return standard response
      const aiResponse = await processChat(message, history || [], appContext);
      return Response.json({ response: aiResponse });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
