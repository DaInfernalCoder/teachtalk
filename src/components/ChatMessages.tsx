"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { Button } from "./ui/button";

interface Message {
  aiGen: boolean;
  text: string;
}

type Props = { chatId: number };

const ChatMessages: React.FC<Props> = ({ chatId }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      aiGen: false,
      text: input,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: input }],
          chatId: chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API error: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response Data:", data);

      const aiMessage: Message = {
        aiGen: true,
        text: data.text,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  });

  return (
    <div className="flex flex-col h-full id" id="message-container">
      <div className="flex-none p-4 bg-white shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">Chat</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message: Message, index: number) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.aiGen
                  ? "bg-white text-gray-800 mr-auto"
                  : "bg-blue-500 text-white ml-auto"
              } max-w-[75%] shadow-sm`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex-none p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatMessages;
