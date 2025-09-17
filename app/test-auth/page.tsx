"use client"

import { useState } from "react"
import { signup, login, logout } from "@/lib/auth"

export default function TestAuthPage() {
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Firebase Auth Test</h2>
        
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border p-2 mb-2 rounded"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white p-2 rounded mb-2"
        >
          Signup
        </button>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded mb-2"
        >
          Login
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Logout
        </button>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </div>
    </div>
  )
}
