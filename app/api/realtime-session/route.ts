import { type NextRequest, NextResponse } from "next/server"
import {
  generateConversationSystemPrompt,
  type ConversationConfig,
} from "@/prompts/conversation-prompts"

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, language, mode, voice, interviewContext } =
      await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      )
    }

    // Build system instructions from existing conversation prompts
    const config: ConversationConfig = {
      topic: topic || "general conversation",
      difficulty: difficulty || 3,
      language: (language || "en") as "en" | "vi",
      mode: (mode || "casual-chat") as
        | "casual-chat"
        | "speaking-practice"
        | "interview",
      interviewContext,
    }

    const instructions = generateConversationSystemPrompt(config)

    // Map voice names to Realtime API voices
    const voiceMap: Record<string, string> = {
      alloy: "alloy",
      echo: "echo",
      fable: "fable",
      onyx: "onyx",
      nova: "nova",
      shimmer: "shimmer",
      ash: "ash",
      ballad: "ballad",
      coral: "coral",
      sage: "sage",
      verse: "verse",
    }

    const realtimeVoice = voiceMap[voice] || "alloy"

    // Request an ephemeral client secret from OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expires_after: {
            anchor: "created_at",
            seconds: 600, // 10 minute TTL
          },
          session: {
            type: "realtime",
            model: "gpt-4o-realtime-preview",
            instructions,
            voice: realtimeVoice,
            input_audio_transcription: {
              model: "whisper-1",
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        "OpenAI Realtime session error:",
        response.status,
        errorText,
      )
      return NextResponse.json(
        { error: "Failed to create realtime session" },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      clientSecret: data.value,
      expiresAt: data.expires_at,
    })
  } catch (error) {
    console.error("Realtime session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
