// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAnalytics, Analytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// ✅ Prevent multiple initializations
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// ✅ Analytics only on client
let analytics: Analytics | null = null
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
  } catch (err) {
    console.warn("Analytics not available:", err)
  }
}

// ✅ Exports
export const db = getFirestore(app)
export const auth = getAuth(app)
export { analytics }
