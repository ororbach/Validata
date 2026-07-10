import { generateChatStream } from '@/services/chatService';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { messages, dataContext } = await req.json();
    return await generateChatStream(messages, dataContext);
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
