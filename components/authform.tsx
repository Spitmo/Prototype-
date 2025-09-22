"use client"

import { useState } from "react"
import { auth, db } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import {
  query,
  where,
  getDocs,
  writeBatch,
  collection,
  doc,
  getDoc,
} from "firebase/firestore"
import { useAppStore } from "@/lib/store"

interface AuthFormProps {
  onSuccess?: () => void
  currentGuestId?: string | null
}

export default function AuthForm({ onSuccess, currentGuestId }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const authenticateAdmin = useAppStore((state) => state.authenticateAdmin)
  const logoutAdmin = useAppStore((state) => state.logoutAdmin)

  // ✅ Guest messages transfer
  const transferGuestMessages = async (userId: string) => {
    if (!currentGuestId) return

    try {
      const messagesRef = collection(db, "messages")
      const q = query(messagesRef, where("userId", "==", currentGuestId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return

      const batch = writeBatch(db)

      querySnapshot.forEach((document) => {
        const newMessageRef = doc(collection(db, "messages"))
        batch.set(newMessageRef, {
          ...document.data(),
          userId,
        })
        batch.delete(document.ref)
      })

      await batch.commit()
      console.log("✅ Guest messages transferred")
      localStorage.removeItem("guestUserId")
    } catch (err) {
      console.error("❌ Error transferring guest messages:", err)
    }
  }

  // ✅ Admin check
  const checkAdmin = async (uid: string) => {
    try {
      const ref = doc(db, "users", uid)
      const snap = await getDoc(ref)

      if (snap.exists() && snap.data()?.isAdmin === true) {
        console.log("👑 Admin detected:", snap.data())
        authenticateAdmin()
      } else {
        logoutAdmin()
      }
    } catch (err) {
      console.error("❌ Error checking admin:", err)
      logoutAdmin()
    }
  }

  // ✅ Handle login/signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("⚠️ Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const userCredential = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password)

      const uid = userCredential.user.uid

      if (currentGuestId) {
        await transferGuestMessages(uid)
      }

      await checkAdmin(uid)

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

      {currentGuestId && (
        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
          <p>Your guest chat history will be saved to your account.</p>
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
        minLength={6}
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

      <p className="text-sm text-center">
        <span
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </span>
      </p>
    </form>
  )
}
