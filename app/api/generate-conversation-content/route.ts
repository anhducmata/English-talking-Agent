import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getConversationSystemPrompt, getDefaultContentByMode } from "@/prompts/conversation-prompts"

export async function POST(request: NextRequest) {
  try {
    const { rawTopic, conversationMode, language } = await request.json()

    console.log("Conversation content request:", { rawTopic, conversationMode, language })

    if (!rawTopic || !conversationMode) {
      return NextResponse.json({ error: "Topic and conversation mode are required" }, { status: 400 })
    }

    const systemPrompt = getConversationSystemPrompt(conversationMode, language || "en")

    const userPrompt = `Topic: "${rawTopic}"

Generate conversation content for this topic in the specified format.`

    console.log("Generating conversation content with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    console.log("OpenAI conversation content response received")

    try {
      const content = JSON.parse(result.text)
      return NextResponse.json(content)
    } catch (parseError) {
      console.error("Failed to parse conversation content JSON:", parseError)

      // Return default content
      const defaultContent = getDefaultContentByMode(conversationMode, rawTopic)
      return NextResponse.json({
        topic: rawTopic,
        ...defaultContent,
      })
    }
  } catch (error) {
    console.error("Conversation content generation error:", error)

    // Return fallback content
    const fallbackContent = {
      topic: "English Practice",
      goal: "Practice English conversation and improve communication skills.",
      rules: "We'll have a natural conversation with helpful guidance and feedback.",
      expectations: "You'll gain confidence and improve your English speaking abilities.",
    }

    return NextResponse.json(fallbackContent)
  }
}
