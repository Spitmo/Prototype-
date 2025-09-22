"use client"

import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAppStore } from "@/lib/store"

export default function AuthListener() {
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminAuthenticated(false)
        return
      }

      try {
        const ref = doc(db, "users", user.uid)
        const snap = await getDoc(ref)
        const isAdmin = !!(snap.exists() && snap.data()?.isAdmin === true)
        setAdminAuthenticated(isAdmin)
      } catch (err) {
        console.error("AuthListener error:", err)
        setAdminAuthenticated(false)
      }
    })

    return () => unsub()
  }, [setAdminAuthenticated])

  return null
}
