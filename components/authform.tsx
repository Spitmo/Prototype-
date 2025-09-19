"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

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
    } catch (error: any) {
      alert("❌ Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-md shadow-sm">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-500"}`}
      >
        {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
      </button>
      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-blue-600 cursor-pointer text-center"
      >
        {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
      </p>
    </form>
  )
}
