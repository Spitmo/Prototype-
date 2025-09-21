"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Mic, X } from "lucide-react"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import AuthForm from "../components/authform"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export default function AiChatInterface() {
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll down
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Track Auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) setShowAuth(false) // close modal on login
    })
    return () => unsub()
  }, [])

  // --- Speech to text hook ---
  const { transcript, isListening, startListening, stopListening } = useSpeechToText()
  useEffect(() => {
    if (transcript) setInputValue(transcript)
  }, [transcript])

  // Load messages for logged-in user OR guest
  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "chats", currentUser.uid, "messages"),
        orderBy("createdAt", "asc")
      )
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
          timestamp: new Date((doc.data() as any).createdAt?.toDate?.() || Date.now()),
        }))
        setMessages(loaded as Message[])
      })
      return () => unsubscribe()
    } else {
      const guestChats = localStorage.getItem("guestChat")
      if (guestChats) setMessages(JSON.parse(guestChats))
    }
  }, [currentUser])

  // Guest → User migration
  useEffect(() => {
    if (currentUser) {
      const guestChats = localStorage.getItem("guestChat")
      if (guestChats) {
        const chats = JSON.parse(guestChats)
        chats.forEach(async (msg: any) => {
          await addDoc(collection(db, "chats", currentUser.uid, "messages"), {
            content: msg.content,
            isBot: msg.isBot,
            createdAt: serverTimestamp(),
          })
        })
        localStorage.removeItem("guestChat")
      }
    }
  }, [currentUser])

  // Handle Send Message
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
      // Save user message
      if (currentUser) {
        await addDoc(collection(db, "chats", currentUser.uid, "messages"), {
          content: userMessage.content,
          isBot: false,
          createdAt: serverTimestamp(),
        })
      } else {
        const existing = localStorage.getItem("guestChat")
        const arr = existing ? JSON.parse(existing) : []
        localStorage.setItem("guestChat", JSON.stringify([...arr, userMessage]))
      }

      // AI call
      const chatMessages = [
        ...messages.map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.content })),
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
        await addDoc(collection(db, "chats", currentUser.uid, "messages"), {
          content: botMessage.content,
          isBot: true,
          createdAt: serverTimestamp(),
        })
      }
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
    <section id="chat" className="py-16 relative">
      {/* Auth Modal */}
      {showAuth && !currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            <AuthForm onSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {/* Logout + Login Buttons */}
      <div className="flex justify-end max-w-4xl mx-auto mb-2">
        {currentUser ? (
          <Button variant="outline" onClick={() => signOut(auth)}>
            Logout
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowAuth(true)}>
            Login / Sign Up
          </Button>
        )}
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center bg-gradient-calm">
          <CardTitle className="text-2xl text-black">AI Mental Health Assistant</CardTitle>
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
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex p-4 space-x-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button onClick={handleSendMessage} disabled={isTyping}>
              <Send />
            </Button>
            <Button onClick={isListening ? stopListening : startListening}>
              <Mic />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

