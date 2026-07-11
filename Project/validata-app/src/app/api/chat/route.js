// This router file handles AI chat requests.
import { generateChatStream } from '@/services/chatService';

export const maxDuration = 60;

// This function processes POST requests and returns a streamed chat response.
export async function POST(req) {
  try {
    const { messages, dataContext } = await req.json();
    return await generateChatStream(messages, dataContext);
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
