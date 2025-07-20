import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set. Add it to your Vercel project or .env file." },
        { status: 500 },
      )
    }

    const { text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Text and target language are required" }, { status: 400 })
    }

    const systemPrompt = `You are a professional translator. Translate the given English text to Vietnamese naturally and accurately. Only return the translation, no explanations.`

    const userPrompt = `Translate this English text to Vietnamese: "${text}"`

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!openAIRes.ok) {
      const err = await openAIRes.json().catch(() => ({}))
      console.error("OpenAI Translation error: ", err)
      return NextResponse.json(
        { error: err?.error?.message ?? "Failed to translate text" },
        { status: openAIRes.status },
      )
    }

    const result = await openAIRes.json()
    const translation = result.choices[0]?.message?.content || "Translation failed"

    return NextResponse.json({ translation })
  } catch (e) {
    console.error("Translation route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
