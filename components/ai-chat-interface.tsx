"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Mic } from "lucide-react"
import { useSpeechToText } from "@/hooks/useSpeechToText"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your friendly AI buddy 😊 What's on your mind today? Let's chat!",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // --- Speech to text hook ---
  const { transcript, isListening, startListening, stopListening } = useSpeechToText()

  useEffect(() => {
    if (transcript) setInputValue(transcript)
  }, [transcript])

  // 🔥 Updated handleSendMessage with Firestore save
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // 1️⃣ Save user message to Firestore
      await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123", // later replace with Firebase Auth uid
          content: userMessage.content,
          isBot: false,
        }),
      })

      // 2️⃣ Prepare chat messages for AI API
      const chatMessages = [
        ...messages.map((m) => ({
          role: m.isBot ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: inputValue },
      ]

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages }),
      })

      const data = await res.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.text,
        isBot: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      // 3️⃣ Save bot message to Firestore
      await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "bot",
          content: botMessage.content,
          isBot: true,
        }),
      })
    } catch (error) {
      console.error("Error fetching bot response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, something went wrong. Please try again.",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  return (
    <section id="chat" className="py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center bg-gradient-calm">
          <div className="relative inline-block p-4 mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
              <div className="bg-white rounded-lg h-full w-full"></div>
            </div>
            <div className="relative">
              <CardTitle className="text-2xl text-black">AI Mental Health Assistant</CardTitle>
            </div>
          </div>
          <p className="text-muted-foreground">
            I'm here to listen and help. Everything you share is confidential.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                    message.isBot ? "" : "flex-row-reverse space-x-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isBot ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    {message.isBot ? (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or speak your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
              <Button onClick={isListening ? stopListening : startListening}>
                <Mic className="w-4 h-4" /> {isListening ? "Stop" : "Speak"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
