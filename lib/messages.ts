// lib/messages.ts
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveMessage = async (
  userId: string,
  content: string,
  isBot: boolean = false
) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      userId,
      content,
      isBot,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};
