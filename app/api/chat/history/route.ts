import { NextRequest } from "next/server"
import { getMessages } from "@/lib/bigquery"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return new Response("Missing userId", { status: 400 })
  const messages = await getMessages(userId)
  return new Response(JSON.stringify(messages), { headers: { "Content-Type": "application/json" } })
}

