"use client"

import { useState } from "react"
import { signup, login, logout } from "@/lib/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

interface ChatbotLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChatbotLoginModal({ open, onOpenChange }: ChatbotLoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleSignup = async () => {
    try {
      await signup(email, password)
      setMessage("✅ Signup successful!")
    } catch (err: any) {
      setMessage("❌ " + err.message)
    }
  }

  const handleLogin = async () => {
    try {
      await login(email, password)
      setMessage("✅ Login successful!")
    } catch (err: any) {
      setMessage("❌ " + err.message)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage("✅ Logged out!")
    } catch (err: any) {
      setMessage("❌ " + err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chatbot Login</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border p-2 rounded"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full border p-2 rounded"
          />

          <button
            onClick={handleSignup}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Signup
          </button>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Login
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>

          {message && <p className="mt-2 text-center text-sm">{message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
