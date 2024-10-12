import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { chatId, aiMessage } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // If there's an AI message, save it to the database
    if (aiMessage) {
      await db.insert(messages).values({
        chatId: chatId,
        content: aiMessage,
        role: 'ai'
      });
    }

    // Fetch all messages for the chat, including the new AI message
    const chatMessages = await db.select().from(messages).where(eq(messages.chatId, chatId));

    // Map 'ai' role to 'assistant' for frontend compatibility
    const mappedMessages = chatMessages.map(message => ({
      ...message,
      role: message.role === 'ai' ? 'assistant' : message.role
    }));

    return NextResponse.json(mappedMessages);
  } catch (error) {
    console.error('Error handling messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
