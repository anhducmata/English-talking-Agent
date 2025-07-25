import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Text and target language are required" }, { status: 400 })
    }

    const { text: translation } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Translate the following text into ${targetLanguage === "en" ? "English" : "Vietnamese"}: "${text}"`,
    })

    return NextResponse.json({ translation })
  } catch (error) {
    console.error("Error translating text:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
