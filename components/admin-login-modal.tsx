"use client"

import { useState } from "react"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useAppStore } from "@/lib/store"

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const setAdminAuth = useAppStore((state) => state.authenticateAdmin) // ✅ store function

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Step 1: Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password)

      // Step 2: Firestore admin flag check
      const ref = doc(db, "users", userCred.user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists() || snap.data()?.isAdmin !== true) {
        await signOut(auth)
        setError("Access denied. Admin privileges required.")
        setLoading(false)
        return
      }

      // ✅ Update global store (isAdminAuthenticated → true)
      setAdminAuth()
      // ✅ Success callback
      if (onSuccess) onSuccess()

      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Admin Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border p-2 rounded"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-600 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
