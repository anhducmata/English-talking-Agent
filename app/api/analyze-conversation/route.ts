import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { generateAnalysisSystemPrompt, cleanJsonResponse, analysisFallbacks } from "@/prompts/general-prompts"

export async function POST(request: NextRequest) {
  try {
    const { conversation, mode, language, topic } = await request.json()

    console.log("Analysis request received:", {
      conversationLength: conversation?.length,
      mode,
      language,
      topic,
    })

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: "Conversation array is required" }, { status: 400 })
    }

    const config = {
      mode: (mode || "speaking-practice") as "speaking-practice" | "casual-chat" | "interview",
      language: (language || "en") as "en" | "vi",
      topic: topic || "general conversation",
    }

    const systemPrompt = generateAnalysisSystemPrompt(config)

    // Format conversation for analysis
    const conversationText = conversation
      .map((msg: any) => `${msg.role === "user" ? "Student" : "AI"}: ${msg.content}`)
      .join("\n")

    const userPrompt = `Analyze this conversation:

${conversationText}

Provide a detailed analysis in the specified JSON format.`

    console.log("Generating analysis with OpenAI...")
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
      maxTokens: 1000,
    })

    console.log("OpenAI analysis response received:", result.text.substring(0, 200) + "...")

    // Clean and parse the JSON response
    const cleanedJson = cleanJsonResponse(result.text)
    const analysis = JSON.parse(cleanedJson)

    console.log("Analysis parsed successfully")
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)

    // Return fallback analysis
    const fallbackLanguage = "en" as const
    const fallbackMode = "speaking-practice" as const

    try {
      const requestData = await request.json()
      const lang = (requestData.language || "en") as "en" | "vi"
      const mode = (requestData.mode || "speaking-practice") as keyof (typeof analysisFallbacks)["en"]

      const fallbackAnalysis = analysisFallbacks[lang]?.[mode] || analysisFallbacks.en["speaking-practice"]

      return NextResponse.json(fallbackAnalysis)
    } catch (parseError) {
      console.error("Fallback parsing error:", parseError)
      return NextResponse.json(analysisFallbacks.en["speaking-practice"])
    }
  }
}
