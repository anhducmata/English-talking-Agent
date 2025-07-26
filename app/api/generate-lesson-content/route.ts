import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { generateLessonSystemPrompt, generateLessonUserPrompt, lessonFallbacks } from "@/prompts/lesson-prompts"

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, language, lessonType } = await request.json()

    console.log("Lesson content request:", { topic, difficulty, language, lessonType })

    if (!topic || !lessonType) {
      return NextResponse.json({ error: "Topic and lesson type are required" }, { status: 400 })
    }

    const config = {
      topic,
      difficulty: difficulty || 3,
      language: (language || "en") as "en" | "vi",
      lessonType: lessonType as "vocabulary" | "grammar" | "conversation" | "pronunciation",
    }

    const systemPrompt = generateLessonSystemPrompt(config)
    const userPrompt = generateLessonUserPrompt(config)

    console.log("Generating lesson content with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("OpenAI lesson content response received")
    return NextResponse.json({ content: result.text })
  } catch (error) {
    console.error("Lesson content generation error:", error)

    // Return fallback content
    const fallbackLanguage = "en" as const
    const fallbackType = "vocabulary" as const

    try {
      const requestData = await request.json()
      const lang = (requestData.language || "en") as "en" | "vi"
      const type = (requestData.lessonType || "vocabulary") as keyof (typeof lessonFallbacks)["en"]

      const fallbackContent = lessonFallbacks[lang]?.[type] || lessonFallbacks.en.vocabulary

      return NextResponse.json({ content: fallbackContent })
    } catch (parseError) {
      return NextResponse.json({ content: lessonFallbacks.en.vocabulary })
    }
  }
}
