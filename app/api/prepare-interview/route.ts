import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import {
  generateInterviewSystemPrompt,
  generateInterviewUserPrompt,
  interviewFallbacks,
} from "@/prompts/interview-prompts"

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, language, interviewType, position } = await request.json()

    console.log("Interview preparation request:", { topic, difficulty, language, interviewType, position })

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const config = {
      topic,
      difficulty: difficulty || 3,
      language: (language || "en") as "en" | "vi",
      interviewType: (interviewType || "general") as "technical" | "behavioral" | "general" | "academic",
      position,
    }

    const systemPrompt = generateInterviewSystemPrompt(config)
    const userPrompt = generateInterviewUserPrompt(config, "start")

    console.log("Generating interview preparation with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 800,
    })

    console.log("OpenAI interview preparation response received")
    return NextResponse.json({ content: result.text })
  } catch (error) {
    console.error("Interview preparation error:", error)

    // Return fallback content
    const fallbackLanguage = "en" as const
    const fallbackType = "general" as const

    try {
      const requestData = await request.json()
      const lang = (requestData.language || "en") as "en" | "vi"
      const type = (requestData.interviewType || "general") as keyof (typeof interviewFallbacks)["en"]

      const fallbackContent = interviewFallbacks[lang]?.[type] || interviewFallbacks.en.general

      return NextResponse.json({ content: fallbackContent })
    } catch (parseError) {
      return NextResponse.json({ content: interviewFallbacks.en.general })
    }
  }
}
