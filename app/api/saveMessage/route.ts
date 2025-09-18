// app/api/saveMessage/route.ts
import { NextResponse } from "next/server";
import { saveMessage } from "@/lib/messages";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, content, isBot } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const result = await saveMessage(userId || "anon", content, !!isBot);

    return NextResponse.json({ success: true, id: result.id });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
