// app/api/saveMessage/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, content, isBot } = await req.json();

    const docRef = await addDoc(collection(db, "messages"), {
      userId,
      content,
      isBot,
      createdAt: serverTimestamp(), // << important
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (e: any) {
    console.error("saveMessage error:", e);
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}
