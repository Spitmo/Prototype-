"use client"

import { useState, useRef, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User as UserIcon, Mic } from "lucide-react"
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
      content: "👋 Hi! I'm your AI Health Assistant. How are you feeling today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user))
    return () => unsub()
  }, [])

  // 🎤 Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = "en-US"
        recognition.interimResults = false
        recognition.continuous = false

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue((prev) => prev + " " + transcript)
        }

        recognition.onend = () => setListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: inputValue }] }),
      })
      const data = await res.json()
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.text,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: "error", content: "⚠️ Error fetching response.", isBot: true, timestamp: new Date() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      recognitionRef.current?.start()
      setListening(true)
    }
  }

  return (
    <section className="py-10">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center bg-gradient-to-r from-green-400 to-emerald-600 h-24 flex items-center justify-center rounded-xl">
          <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7" /> AI Health Assistant
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="bg-gray-50">
          <AuthBanner show={showAuth} onClose={() => setShowAuth(false)} />

          {/* Chat messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? "justify-start" : "justify-end"}`}>
                <div className="flex items-start gap-2 max-w-md">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow ${
                      m.isBot ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                    }`}
                  >
                    {m.isBot ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl shadow ${
                      m.isBot ? "bg-white border border-gray-200 text-gray-800" : "bg-blue-500 text-white"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && <p className="text-sm text-gray-400 italic">Bot is typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={toggleListening}
              className={`${
                listening ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Mic className={`w-5 h-5 ${listening ? "text-white" : "text-black"}`} />
            </Button>
            <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
