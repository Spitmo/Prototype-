"use client"

import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useAppStore } from "@/lib/store"

export default function AuthListener() {
  const setAdminAuth = useAppStore((s) => s.setAdminAuthenticated)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminAuth(false)
        return
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists() && snap.data()?.isAdmin === true) {
          setAdminAuth(true)
        } else {
          setAdminAuth(false)
        }
      } catch (err) {
        console.error("AuthListener error:", err)
        setAdminAuth(false)
      }
    })

    return () => unsub()
  }, [setAdminAuth])

  return null
}
