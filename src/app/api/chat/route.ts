import { text } from "drizzle-orm/pg-core";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { Message, streamText } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const model = openai.chat("gpt-4o-mini", {});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    console.log(`Searching for chat with ID: ${chatId}`);
    console.log(`Found ${_chats.length} chats`);

    const fileKey = _chats[0].fileKey;
    if (!fileKey) {
      throw new Error("api/chat/route.ts, No fileKey found");
    } else {
      console.log("fileKey found", fileKey);
    }

    const lastMessage = messages[messages.length - 1];
    console.log("last message", lastMessage.content.toString());

    // Save user message to the database
    try {
      await db.insert(_messages).values({
        chatId, 
        content: lastMessage.content, 
        role: "user"
      });
      console.log("User message saved into db");
    } catch (error) {
      console.error("Error saving user message to db:", error);
    }

    const context = await getContext(lastMessage.content.toString(), fileKey);
    console.log("Context received:", context.toString());

    const systemMessage = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    let aiMessageContent = '';

    const response = await streamText({
      model,
      messages: [
        systemMessage,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      onFinish: async (event: any) => {
        const completion = event.completion;
        aiMessageContent = completion;
        // Save AI message to the database
        try {
          await db.insert(_messages).values({
            chatId, 
            content: completion, 
            role: "system"
          });
          console.log("AI message saved into db");
        } catch (error) {
          console.error("Error saving AI message to db:", error);
        }
      }
    });
    
    return response.toAIStreamResponse();

  } catch (error) {
    console.error(
      "Error in route.ts (app/api/chat) with the ai stream:",
      error
    );
    return NextResponse.json(
      { error: "An error occurred with ai stream" },
      { status: 500 }
    );
  }
}