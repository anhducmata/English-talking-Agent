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

Based on this topic and conversation mode "${conversationMode}", create content that includes:

1. A specific role-based scenario (e.g., for food ordering: "I will be a restaurant server and you are a customer", for interviews: "I will be an interviewer for [specific position]")

2. Clear learning objectives for what the user will practice

3. Specific measurable expectations (e.g., "User can order food politely and handle menu questions", "User can explain technical concepts clearly", "User can discuss opinions with supporting reasons")

4. Conversation rules and structure

Make sure the expectations are specific, actionable, and measurable based on the topic and conversation mode.`

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
      // Clean the response text by removing markdown code blocks
      let cleanedText = result.text.trim()
      
      // Remove ```json at the beginning
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '')
      }
      
      // Remove ``` at the beginning if it exists
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '')
      }
      
      // Remove ``` at the end
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.replace(/\s*```$/, '')
      }
      
      console.log("Cleaned JSON text:", cleanedText)
      
      const content = JSON.parse(cleanedText)
      return NextResponse.json(content)
    } catch (parseError) {
      console.error("Failed to parse conversation content JSON:", parseError)
      console.error("Original text:", result.text)

      // Return default content
      const defaultContent = getDefaultContentByMode(conversationMode, rawTopic)
      return NextResponse.json({
        topic: rawTopic,
        ...defaultContent,
      })
    }
  } catch (error) {
    console.error("Conversation content generation error:", error)

    // Return fallback content based on conversation mode and topic
    try {
      const requestData = await request.clone().json()
      const mode = requestData.conversationMode || "practice"
      const topic = requestData.rawTopic || "English Practice"
      
      const fallbackContent = getDefaultContentByMode(mode, topic)
      return NextResponse.json({
        topic: topic,
        ...fallbackContent,
      })
    } catch (parseError) {
      // Ultimate fallback
      const ultimateFallback = {
        topic: "English Practice",
        goal: "Practice English conversation and improve communication skills.",
        rules: "I will help you practice English through natural conversation. We'll discuss various topics to help improve your speaking abilities.",
        expectations: "Express your thoughts clearly, use appropriate vocabulary for your level, ask follow-up questions, and maintain conversation flow.",
      }

      return NextResponse.json(ultimateFallback)
    }
  }
}
