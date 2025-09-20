"use client"

import { useState, useRef, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User as UserIcon } from "lucide-react"
import AuthBanner from "./AuthBanner"

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
      content: "Hi! I'm your friendly AI buddy 😊 What's on your mind today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false) // 👈 state for modal
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Track Firebase user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user))
    return () => unsub()
  }, [])

  // Guest mode: store in localStorage
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("guestChat", JSON.stringify(messages))
    }
  }, [messages, currentUser])

  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem("guestChat")
      if (saved) setMessages(JSON.parse(saved))
    }
  }, [currentUser])

  // ✅ Trigger AuthBanner on 5th message for guest
  useEffect(() => {
    if (messages.length === 5 && !currentUser) {
      setShowAuth(true)
    }
  }, [messages, currentUser])

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

      if (currentUser) {
        // Save user message
        await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.uid,
            text: userMessage.content,
            isBot: false,
            timestamp: userMessage.timestamp.toISOString(),
          }),
        })
        // Save bot message
        await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.uid,
            text: botMessage.content,
            isBot: true,
            timestamp: botMessage.timestamp.toISOString(),
          }),
        })
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: "error", content: "Error fetching response.", isBot: true, timestamp: new Date() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <section id="chat" className="py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center bg-gradient-to-r from-orange-300 to-green-300">
          <CardTitle className="text-2xl">AI Mental Health Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 🔥 Login modal */}
          <AuthBanner show={showAuth} onClose={() => setShowAuth(false)} />

          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? "justify-start" : "justify-end"}`}>
                <div className="flex items-center space-x-2 max-w-md">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {m.isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div
                    className={`p-2 rounded-lg ${
                      m.isBot ? "bg-gray-100 text-black" : "bg-blue-500 text-white"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && <p className="text-sm text-gray-400">Bot is typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-2 mt-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
