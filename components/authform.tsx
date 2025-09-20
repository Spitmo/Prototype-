"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

export default function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("⚠️ Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      onSuccess?.()
    } catch (err: any) {
      setError("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md w-full max-w-sm"
    >
      <h2 className="text-2xl font-semibold text-center">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-white font-semibold transition-colors ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
      </button>

      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-blue-600 cursor-pointer text-center hover:underline"
      >
        {isLogin
          ? "Need an account? Sign up"
          : "Already have an account? Login"}
      </p>
    </form>
  )
}
