import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";

export const saveMessage = async (userId: string, text: string, role: string) => {
  await addDoc(collection(db, "messages"), {
    userId,
    text,
    role, // "user" or "bot"
    createdAt: new Date(),
  });
};

export const getUserMessages = async (userId: string) => {
  const q = query(
    collection(db, "messages"),
    where("userId", "==", userId),
    orderBy("createdAt", "asc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};
