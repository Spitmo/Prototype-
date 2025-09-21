"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Mic, X } from "lucide-react"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import AuthForm from "@/components/authform"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
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
}

export default function AiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // scroll helper
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => scrollToBottom(), [messages])

  // speech-to-text hook
  const { transcript, isListening, startListening, stopListening } = useSpeechToText()
  useEffect(() => {
    if (transcript) setInputValue(transcript)
  }, [transcript])

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) setShowAuth(false) // close modal on login
    })
    return () => unsubscribe()
  }, [])

  // Load messages: guest or Firestore
  useEffect(() => {
    let unsubscribeFromFirestore: (() => void) | null = null
    if (!currentUser) {
      // Guest: load from localStorage
      const guest = localStorage.getItem("guestChat")
      if (guest) {
        try {
          const arr = JSON.parse(guest)
          setMessages(prev => [...prev, ...arr])
        } catch {
          setMessages(prev => [...prev])
        }
      }
      return
    }

    // Logged in: migrate guest chats + subscribe to Firestore
    (async () => {
      const guest = localStorage.getItem("guestChat")
      if (guest) {
        try {
          const arr = JSON.parse(guest)
          for (const msg of arr) {
            await addDoc(collection(db, "messages"), {
              userId: currentUser.uid,
              content: msg.content,
              isBot: !!msg.isBot,
              createdAt: serverTimestamp(),
            })
          }
          localStorage.removeItem("guestChat")
        } catch (e) {
          console.error("Failed migrating guest chats:", e)
        }
      }

      const q = query(
        collection(db, "messages"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "asc")
      )
      unsubscribeFromFirestore = onSnapshot(q, (snap) => {
        const loaded = snap.docs.map((doc) => {
          const data = doc.data() as any
          return {
            id: doc.id,
            content: data.content,
            isBot: !!data.isBot,
            createdAt: data.createdAt,
          } as Message
        })
        setMessages(prev => {
          // Avoid duplicates with initial intro
          const withoutInit = loaded.filter(m => m.content !== messages[0].content)
          return [messages[0], ...withoutInit]
        })
      })
    })()

    return () => {
      if (unsubscribeFromFirestore) unsubscribeFromFirestore()
    }
  }, [currentUser])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const text = inputValue.trim()
    const userMsg: Message = { id: Date.now().toString(), content: text, isBot: false }
    setMessages((p) => [...p, userMsg])
    setInputValue("")
    setIsTyping(true)

    try {
      if (currentUser) {
        await addDoc(collection(db, "messages"), {
          userId: currentUser.uid,
          content: text,
          isBot: false,
          createdAt: serverTimestamp(),
        })
      } else {
        const existing = localStorage.getItem("guestChat")
        const arr = existing ? JSON.parse(existing) : []
        arr.push(userMsg)
        localStorage.setItem("guestChat", JSON.stringify(arr))
      }

      const chatMessages = [
        ...messages.map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.content })),
        { role: "user", content: text },
      ]

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages }),
      })
      const data = await res.json()
      const botMsg: Message = { id: (Date.now() + 1).toString(), content: data.text, isBot: true }

      setMessages((p) => [...p, botMsg])

      if (currentUser) {
        await addDoc(collection(db, "messages"), {
          userId: currentUser.uid,
          content: botMsg.content,
          isBot: true,
          createdAt: serverTimestamp(),
        })
      } else {
        const existing = localStorage.getItem("guestChat")
        const arr = existing ? JSON.parse(existing) : []
        arr.push(botMsg)
        localStorage.setItem("guestChat", JSON.stringify(arr))
      }
    } catch (err) {
      console.error("send message error", err)
      setMessages((p) => [
        ...p,
        { id: (Date.now() + 2).toString(), content: "Something went wrong. Try again.", isBot: true },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage()
  }

  return (
    <section id="chat" className="py-16 relative">
      {/* Auth modal for guests */}
      {showAuth && !currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <button onClick={() => setShowAuth(false)} className="absolute top-2 right-2 text-gray-500">
              <X size={20} />
            </button>
            <AuthForm onSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {/* Login / Logout buttons */}
      <div className="flex justify-end max-w-4xl mx-auto mb-2">
        {currentUser ? (
          <Button
            variant="outline"
            onClick={async () => {
              await signOut(auth)
              setCurrentUser(null)
              setShowAuth(true)
            }}
          >
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
          <p className="text-muted-foreground">I'm here to listen and help. Everything you share is confidential.</p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? "bg-primary" : "bg-secondary"}`}>
                    {msg.isBot ? <Bot className="w-4 h-4 text-primary-foreground" /> : <User className="w-4 h-4 text-secondary-foreground" />}
                  </div>
                  <div className={`p-3 rounded-lg ${msg.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isTyping || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
              <Button onClick={isListening ? stopListening : startListening}>
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
