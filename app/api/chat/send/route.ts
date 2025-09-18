import { NextRequest } from "next/server"
import { saveMessage } from "@/lib/bigquery"

export async function POST(req: NextRequest) {
  const { userId, text } = await req.json()
  if (!userId || !text) return new Response("Missing data", { status: 400 })
  await saveMessage(userId, text, Date.now())
  return new Response("OK")
}