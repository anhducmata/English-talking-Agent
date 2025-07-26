import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { topic, mode, difficulty, language } = await request.json()

    console.log("Prompt generation request:", { topic, mode, difficulty, language })

    if (!topic || !mode) {
      return NextResponse.json({ error: "Topic and mode are required" }, { status: 400 })
    }

    const systemPrompt = `You are a prompt generator for English language practice sessions.

Generate an engaging prompt for a ${mode} session about "${topic}" at difficulty level ${difficulty}/5 in ${language === "vi" ? "Vietnamese context" : "English context"}.

The prompt should:
- Be engaging and motivating
- Set clear expectations
- Provide context for the conversation
- Be appropriate for the difficulty level
- Encourage natural communication

Return only the prompt text, no additional formatting.`

    const userPrompt = `Create a ${mode} prompt for the topic "${topic}" at difficulty level ${difficulty}/5.`

    console.log("Generating prompt with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      maxTokens: 300,
    })

    console.log("OpenAI prompt response received")
    return NextResponse.json({ prompt: result.text.trim() })
  } catch (error) {
    console.error("Prompt generation error:", error)

    // Return fallback prompt
    const fallbackPrompts = {
      "casual-chat": `Let's have a casual conversation about ${request
        .json()
        .then((data) => data.topic)
        .catch(() => "general topics")}. Feel free to share your thoughts and experiences!`,
      "speaking-practice": `Today we'll practice speaking about ${request
        .json()
        .then((data) => data.topic)
        .catch(() => "various topics")}. I'll help you improve your fluency and confidence.`,
      interview: `Welcome to your practice interview session about ${request
        .json()
        .then((data) => data.topic)
        .catch(() => "your background")}. Let's prepare you for success!`,
    }

    const mode = await request
      .json()
      .then((data) => data.mode)
      .catch(() => "casual-chat")
    const fallbackPrompt = fallbackPrompts[mode as keyof typeof fallbackPrompts] || fallbackPrompts["casual-chat"]

    return NextResponse.json({ prompt: fallbackPrompt })
  }
}
