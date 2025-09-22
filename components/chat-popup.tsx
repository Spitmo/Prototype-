"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bot, MessageCircle, X } from "lucide-react"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export default function ChatWidget() {
  const [lastMessage, setLastMessage] = useState(
    "👋 Hi! I'm your AI Health Assistant. How are you feeling today?"
  )
  const [isOpen, setIsOpen] = useState(true) // ✅ toggle state
  const router = useRouter()

  // Load last message from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatMessages")
    if (saved) {
      const msgs: Message[] = JSON.parse(saved)
      if (msgs.length > 0) {
        setLastMessage(msgs[msgs.length - 1].content)
      }
    }
  }, [])

  if (!isOpen) return null // ✅ hide widget when closed

  return (
    <div className="fixed bottom-6 left-6 w-80 rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <Bot className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">AI Health Assistant</h3>
            <p className="text-xs text-green-100">Online</p>
          </div>
        </div>
        {/* ✅ Close Button */}
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-green-600/30">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body - last message preview */}
      <div className="p-4 bg-gray-50">
        <div className="bg-green-100 text-gray-800 rounded-xl px-3 py-2 text-sm inline-block max-w-[90%]">
          {lastMessage}
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-4 py-3 border-t flex justify-center">
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
        >
          <MessageCircle className="w-4 h-4" />
          Chat Now
        </button>
      </div>
    </div>
  )
}
