import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { rawTopic, conversationMode, language } = await request.json()

    if (!rawTopic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert English language teacher creating structured lesson plans. Based on the user's topic and conversation mode, generate a comprehensive lesson structure.

Conversation Mode: ${conversationMode}
Language: ${language}

Generate a JSON response with these fields:
- topic: A refined, clear topic title
- goal: What students should learn (1-2 sentences)
- rules: How you will guide students (1-2 sentences)
- expectations: What students should accomplish (1-2 sentences)

Make the content appropriate for ${conversationMode} practice and suitable for intermediate English learners.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Create a lesson plan for: "${rawTopic}"`,
      maxTokens: 500,
    })

    // Try to parse as JSON, fallback to structured text parsing
    let lessonContent
    try {
      lessonContent = JSON.parse(text)
    } catch {
      // Fallback: create structured content from the raw topic
      lessonContent = {
        topic: rawTopic,
        goal: `Students will practice ${rawTopic.toLowerCase()} in English, improving their vocabulary and conversation skills in this context.`,
        rules: `I will guide the conversation naturally, provide helpful corrections, and encourage students to express themselves clearly.`,
        expectations: `By the end of this session, students should feel more confident discussing ${rawTopic.toLowerCase()} in English.`,
      }
    }

    return NextResponse.json(lessonContent)
  } catch (error) {
    console.error("Error generating lesson content:", error)
    return NextResponse.json({ error: "Failed to generate lesson content" }, { status: 500 })
  }
}
