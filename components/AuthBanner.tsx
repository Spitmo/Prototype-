"use client"

import { useState, useEffect } from "react"
import { login, signup, logout } from "@/lib/useAuth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"

interface AuthBannerProps {
  show: boolean
  onClose: () => void
}

export default function AuthBanner({ show, onClose }: AuthBannerProps) {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => setUser(currUser))
    return () => unsub()
  }, [])

  if (!show) return null

  if (user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 relative">
          <p className="text-center text-sm text-green-700 mb-3">
            Logged in as {user.email}
          </p>
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 relative">
        <h3 className="text-lg font-bold text-center mb-2">
          Save Your Chat History
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Create an account to continue your journey anytime.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <button
          onClick={() => signup(email, password)}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mb-2"
        >
          Signup
        </button>
        <button
          onClick={() => login(email, password)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2"
        >
          Login
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
        >
          Continue without Saving
        </button>
      </div>
    </div>
  )
}
