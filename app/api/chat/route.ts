// /app/api/chat/route.ts
import { NextRequest } from "next/server";

// --- Mood analysis helper ---
function analyzeMood(userText: string) {
  const emotionalKeywords = [
    "depress","depression","anxious","anxiety","stress","tension",
    "dukhi","udasi","lonely","panic","fikr","parishan"
  ];
  const matches = emotionalKeywords.filter(kw => userText.toLowerCase().includes(kw));

  if (matches.length === 0) return { isConcern: false };
  
  if (userText.length < 40) return { isConcern: false, isMild: true };
  
  return { isConcern: true };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json(); // [{ role, content }]
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ text: "Kya bolta bhidu? 😄" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Last user message ---
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const userText = lastUser?.content || "";

    // --- Analyze mood ---
    const mood = analyzeMood(userText);

    // --- System prompt ---
    let systemPrompt = `You are a friendly, casual chatbot buddy.
- Reply in the same language as user (Hindi/English mix allowed)
- Keep tone natural, human-like, supportive
- Use emojis sometimes
- Short replies for greetings, longer for deep talks`;

    if (mood.isConcern) {
      systemPrompt += `
- The user seems seriously stressed, anxious, or depressed.
- Start with empathetic talk.
- After conversation, you may suggest PHQ-9 or GAD-7 test if needed.`;
    } else if (mood.isMild) {
      systemPrompt += `
- User seems slightly stressed or sad.
- Just empathize, do not suggest any test yet.`;
    }

    // --- Prepare messages for model ---
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    // --- OpenRouter call ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
<<<<<<< HEAD
        model: "gpt-oss-20b",
=======
        model: "openai/gpt-oss-20b",
>>>>>>> 42cc12658725d446eba758964591002ef19b50e0
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter API error:", response.status, text);
      return new Response(
        JSON.stringify({ text: `OpenRouter API error: ${response.status}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      "Arre bhidu, reply nahi ban paya 😅";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Internal server error:", err);
    return new Response(
      JSON.stringify({ text: "Kuch gadbad ho gayi re bhai 😅" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

