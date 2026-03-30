import { type NextRequest, NextResponse } from "next/server"
import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import {
  generateConversationSystemPrompt,
  generateConversationUserPrompt,
  conversationFallbacks,
} from "@/prompts/conversation-prompts"

import { type NextRequest, NextResponse } from "next/server"
import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import {
  generateConversationSystemPrompt,
  generateConversationUserPrompt,
  conversationFallbacks,
} from "@/prompts/conversation-prompts"

// Tool definitions for AI to call
const tools = {
  generateAnimalQuiz: tool({
    description:
      "Generate an animal guessing quiz with a partially hidden image. Perfect for kids to guess the animal by seeing only part of the image.",
    parameters: z.object({
      animal: z
        .string()
        .describe("The name of the animal to create a quiz for (e.g., lion, elephant, giraffe)"),
      hidePercentage: z
        .number()
        .describe(
          "Percentage of the image to hide: 25 (hide 1/4), 50 (hide 1/2), or 75 (hide 3/4)"
        )
        .default(50)
        .enum([25, 50, 75]),
      difficulty: z
        .enum(["easy", "medium", "hard"])
        .describe("Difficulty level of the quiz")
        .default("medium"),
    }),
    execute: async (params) => {
      // This tool execution is handled on the client side
      // Return data that will be sent to the client
      return {
        action: "generateAnimalQuiz",
        animal: params.animal,
        hidePercentage: params.hidePercentage,
        difficulty: params.difficulty,
        timestamp: new Date().toISOString(),
      }
    },
  }),
}

export async function POST(request: NextRequest) {
  try {
    const { messages, topic, difficulty, language, mode, interviewContext } = await request.json()

    console.log("Chat request received:", {
      messagesLength: messages?.length,
      topic,
      difficulty,
      language,
      mode,
      hasInterviewContext: !!interviewContext,
    })

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const config = {
      topic: topic || "general conversation",
      difficulty: difficulty || 3,
      language: (language || "en") as "en" | "vi",
      mode: (mode || "casual-chat") as "casual-chat" | "speaking-practice" | "interview",
      interviewContext,
    }

    const systemPrompt = generateConversationSystemPrompt(config)
    const userPrompt = generateConversationUserPrompt(messages, config)

    console.log("Generating response with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      tools: tools,
      temperature: 0.7,
      maxTokens: 300,
    })

    console.log("OpenAI response received successfully")

    // Check if tool was called
    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0]
      console.log("Tool called:", toolCall.toolName, toolCall.args)

      return NextResponse.json({
        message: result.text,
        toolCall: {
          name: toolCall.toolName,
          args: toolCall.args,
          result: toolCall.result,
        },
      })
    }

    // Clean the response to remove any role prefixes
    let cleanedResponse = result.text.trim()

    // Remove common prefixes that might appear
    const prefixesToRemove = [
      /^Assistant:\s*/i,
      /^AI:\s*/i,
      /^AI Teacher:\s*/i,
      /^Response:\s*/i,
      /^Answer:\s*/i,
    ]

    for (const prefix of prefixesToRemove) {
      cleanedResponse = cleanedResponse.replace(prefix, "")
    }

    return NextResponse.json({ message: cleanedResponse })
  } catch (error) {
    console.error("Chat API error:", error)

    // Return fallback response based on mode and language
    const fallbackLanguage = request
      .json()
      .then((data) => data.language)
      .catch(() => "en") as Promise<"en" | "vi">
    const fallbackMode = request
      .json()
      .then((data) => data.mode)
      .catch(() => "casual-chat") as Promise<keyof (typeof conversationFallbacks)["en"]>

    const lang = await fallbackLanguage.catch(() => "en" as const)
    const mode = await fallbackMode.catch(() => "casual-chat" as const)

    const fallbackMessage =
      conversationFallbacks[lang]?.[mode] ||
      (lang === "vi"
        ? "Xin lỗi, tôi gặp sự cố kỹ thuật. Bạn có thể thử lại không?"
        : "Sorry, I'm experiencing technical difficulties. Could you please try again?")

    return NextResponse.json({ message: fallbackMessage })
  }
}
