"use client"
import { useEffect, useState } from "react"
import { login, signup, logout, subscribeToAuthChanges } from "../../lib/useAuth"

interface Message {
  id: number
  text: string
  sender: string
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showAuth, setShowAuth] = useState(false)

  // Load guest chat
  useEffect(() => {
    const saved = localStorage.getItem("guest_chat")
    if (saved) setMessages(JSON.parse(saved))
  }, [])

  // Save guest chat
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guest_chat", JSON.stringify(messages))
    }
  }, [messages, user])

  // Track auth state
  useEffect(() => {
    const unsub = subscribeToAuthChanges((usr) => setUser(usr))
    return () => unsub()
  }, [])

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now(), text: input, sender: "user" }])
    setInput("")
  }

  const handleLogin = async () => {
    try {
      await login(email, password)
      setShowAuth(false)
    } catch (err) {
      alert("Login failed")
    }
  }

  const handleSignup = async () => {
    try {
      await signup(email, password)
      setShowAuth(false)
    } catch (err) {
      alert("Signup failed")
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">My Chatbot</h1>

      <div className="border h-96 overflow-y-auto p-2 bg-gray-50">
        {messages.map(m => (
          <div key={m.id} className={m.sender === "user" ? "text-right" : "text-left"}>
            <span className="px-2 py-1 bg-white border rounded">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 rounded">
          Send
        </button>
      </div>

      {/* Auth Section */}
      <div className="mt-4">
        {!user ? (
          <>
            <button
              onClick={() => setShowAuth(!showAuth)}
              className="underline text-sm text-blue-600"
            >
              {showAuth ? "Hide Login/Signup" : "Login / Signup"}
            </button>

            {showAuth && (
              <div className="mt-2 border p-2 rounded">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="border p-1 w-full mb-2"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="border p-1 w-full mb-2"
                />
                <div className="flex gap-2">
                  <button onClick={handleLogin} className="bg-green-500 text-white px-2 rounded">
                    Login
                  </button>
                  <button onClick={handleSignup} className="bg-gray-700 text-white px-2 rounded">
                    Signup
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">Logged in as {user.email}</span>
            <button onClick={logout} className="text-sm underline text-red-500">Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}
