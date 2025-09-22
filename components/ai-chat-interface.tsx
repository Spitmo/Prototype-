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

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Track Firebase user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user))
    return () => unsub()
  }, [])

  // Guest mode storage
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

  // Show login modal after 5 msgs
  useEffect(() => {
    if (messages.length === 5 && !currentUser) {
      setShowAuth(true)
    }
  }, [messages, currentUser])

  // 🎤 Speech Recognition
  const handleStartListening = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition")
      return
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
      }

      recognitionRef.current.onend = () => {
        setListening(false)
      }
    }

    setListening(true)
    recognitionRef.current.start()
  }

  // ✉️ Send Message
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
        { id: "error", content: "⚠️ Error fetching response.", isBot: true, timestamp: new Date() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <section id="chat" className="py-10">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center bg-gradient-to-r from-green-300 to-emerald-600 h-24 flex items-center justify-center rounded-3xl" >
          <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7" /> AI Health Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-gray-50">
          {/* Login Modal */}
          <AuthBanner show={showAuth} onClose={() => setShowAuth(false)} />

          {/* Chat Box */}
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
                      m.isBot
                        ? "bg-white border border-gray-200 text-gray-800"
                        : "bg-blue-500 text-white"
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

          {/* Input Box */}
          <div className="flex gap-2 mt-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or use mic..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700">
              <Send className="w-5 h-5" />
            </Button>
            <Button
              variant={listening ? "destructive" : "outline"}
              onClick={handleStartListening}
              title="Speak"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
