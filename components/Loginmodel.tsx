"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      alert("⚠️ Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
        alert("✅ Logged in successfully")
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        alert("✅ Account created successfully")
      }
      onClose()
    } catch (error: any) {
      alert("❌ Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-96 relative border border-emerald-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-emerald-600 transition"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-600">
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 p-3 w-full rounded-lg outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 p-3 w-full rounded-lg outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg text-white font-semibold shadow-md transition 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-emerald-600 cursor-pointer mt-6 text-center hover:underline"
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  )
}
