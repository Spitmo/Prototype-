"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User as UserIcon, Mic } from "lucide-react"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"

interface Message {
  id: string
  content: string
  isBot: boolean
  createdAt?: any
  userId?: string
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      content: "👋 Hi! I'm your AI Health Assistant. How are you feeling today?",
      isBot: true,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [guestUserId, setGuestUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Guest ID generator
  const getOrCreateGuestId = (): string => {
    if (typeof window === "undefined") return ""
    let guestId = localStorage.getItem("guestUserId")
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("guestUserId", guestId)
    }
    return guestId
  }

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speech to text
  const { transcript, isListening, startListening, stopListening } = useSpeechToText()
  useEffect(() => {
    if (transcript) setInputValue(transcript)
  }, [transcript])

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        loadMessages(user.uid)
      } else {
        const guestId = getOrCreateGuestId()
        setGuestUserId(guestId)
        setCurrentUser(null)
        loadMessages(guestId)
      }
    })
    return () => unsubscribe()
  }, [])

  // Load messages from Firestore
  const loadMessages = (userId: string) => {
    const q = query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("createdAt", "asc")
    )
    return onSnapshot(q, (snap) => {
      const loaded = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      setMessages((prev) => {
        const init =
          prev.find((m) => m.id === "init") || {
            id: "init",
            content: "👋 Hi! I'm your AI Health Assistant. How are you feeling today?",
            isBot: true,
          }
        return [init, ...loaded]
      })
    })
  }

  // Call AI API
  const getAIResponse = async (userMessage: string, chatHistory: Message[]) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...chatHistory
              .filter((m) => m.id !== "init")
              .map((m) => ({
                role: m.isBot ? "assistant" : "user",
                content: m.content,
              })),
            { role: "user", content: userMessage },
          ],
        }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      return data.text || "I'm here to help. How can I assist you today?"
    } catch {
      return "⚠️ I'm having trouble responding right now."
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const userId = currentUser ? currentUser.uid : guestUserId
    if (!userId) return

    const text = inputValue.trim()
    const userMsg: Message = { id: `u_${Date.now()}`, content: text, isBot: false, userId }
    setMessages((p) => [...p, userMsg])
    setInputValue("")
    setIsTyping(true)

    try {
      await addDoc(collection(db, "messages"), { ...userMsg, createdAt: serverTimestamp() })
      const botResponse = await getAIResponse(text, messages)
      const botMsg: Message = { id: `b_${Date.now()}`, content: botResponse, isBot: true, userId }
      setMessages((p) => [...p, botMsg])
      await addDoc(collection(db, "messages"), { ...botMsg, createdAt: serverTimestamp() })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <section className="py-10">
      {/* Chat card */}
      <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-green-400 to-emerald-600 h-24 flex items-center justify-center rounded-xl">
          <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7" /> AI Health Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-gray-50">
          {/* Messages */}
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
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "outline"}
            >
              <Mic className="w-5 h-5" />
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
