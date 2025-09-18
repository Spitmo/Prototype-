// app/lib/useAuth.ts
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth"
import { app } from "./firebase"

// Auth instance
const auth = getAuth(app)

// 🔹 Login
export async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password)
}

// 🔹 Signup
export async function signup(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password)
}

// 🔹 Logout
export async function logout() {
  return await signOut(auth)
}

// 🔹 Subscribe to auth state
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
