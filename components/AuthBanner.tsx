"use client"

import { useState } from "react"
import { login, signup, logout } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"

export default function AuthBanner() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Track login state
  useState(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => setUser(currUser))
    return () => unsub()
  })

  if (user) {
    return (
      <div className="text-center text-sm p-2 bg-green-100 rounded">
        Logged in as {user.email}{" "}
        <button onClick={logout} className="text-red-600 underline ml-2">
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="text-center text-sm p-2 bg-yellow-100 rounded space-y-2">
      <p>Want to save your chat history?</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-1"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-1 ml-2"
      />
      <div className="space-x-2 mt-1">
        <button onClick={() => signup(email, password)} className="text-blue-600 underline">
          Signup
        </button>
        <button onClick={() => login(email, password)} className="text-blue-600 underline">
          Login
        </button>
      </div>
    </div>
  )
}
