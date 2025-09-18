// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Importing Firestore functions for adding a document
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Function to send a message
export const sendMessage = async (currentUser, inputValue) => {
  try {
    await addDoc(collection(db, "chats"), {
      userId: currentUser.uid,
      text: inputValue,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message: ", error);
  }
};