import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { chats } from "@/lib/db/schema";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatMessages from "@/components/ChatMessages";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen">
      <div className="flex w-full h-screen ">
       
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          {
            <ChatSideBar
              chats={_chats}
              chatId={parseInt(chatId)}
              isPro={false}
            />
          }
        </div>

        {/* pdf viewer */}
        <div className="max-h-screen p-4 overflow-hidden flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>

        {/* chat messages */}
        <div className="flex-[3] border-1-4 overflow-hidden border-1-slate-200">
          <ChatMessages chatId = {parseInt(chatId)}/>
        </div>
      
      </div>
    </div>
  );
};

export default ChatPage;
