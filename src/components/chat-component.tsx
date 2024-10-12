'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowUp, Mic, RefreshCw, Star } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
}

const aiResponses = [
  "That's an interesting point. Let's explore it further.",
  "I see where you're coming from, but have you considered this alternative perspective?",
  "Your argument has merit, but there are some potential counterpoints we should discuss.",
  "That's a complex issue. Let's break it down and analyze each aspect.",
  "I appreciate your viewpoint. How would you address potential criticisms of that stance?",
]

export function ChatComponentComponent() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Great, let's start with the first argument. What do you have for the Pro side debate?", sender: 'ai' },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newUserMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' }
      setMessages((prevMessages: Message[]) => [...prevMessages, { ...newUserMessage, sender: 'user' as 'user' }])
      setInputMessage('')
      setIsTyping(true)

      setTimeout(() => {
        const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
        const newAiMessage = { id: messages.length + 2, text: aiResponse, sender: 'ai' }
        setMessages(prevMessages => [...prevMessages, { ...newUserMessage, sender: 'ai' as 'ai' }])
        setIsTyping(false)
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-100 shadow-xl rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <h1 className="text-2xl font-bold">Debate Champion</h1>
        <p className="text-sm opacity-75">@AdeptusMechanicus</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 shadow'
            }`}>
              <p>{message.text}</p>
              {message.sender === 'ai' && (
                <div className="flex items-center mt-2 space-x-2">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Regenerate response">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {[1, 2, 3, 4].map((star) => (
                    <button key={star} className="text-gray-400 hover:text-yellow-400 transition-colors" aria-label={`Rate ${star} stars`}>
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 p-3 rounded-lg shadow">
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Message Debate Champion..."
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Send message"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <button
            className="text-gray-500 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}