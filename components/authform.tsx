"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-blue-600 cursor-pointer"
      >
        {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
      </p>
    </form>
  )
}
