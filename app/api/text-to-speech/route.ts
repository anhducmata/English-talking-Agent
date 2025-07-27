import { type NextRequest, NextResponse } from "next/server"
import { CloudStorageService } from "@/lib/cloud-storage-service"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "alloy", conversationId, messageId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Call OpenAI TTS API directly
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI TTS API error:", response.status, errorText)
      return NextResponse.json({ error: "Text-to-speech conversion failed" }, { status: response.status })
    }

    // Get the audio data as ArrayBuffer
    const audioBuffer = await response.arrayBuffer()

    // If conversationId and messageId are provided, save to S3 and return signed URL
    if (conversationId && messageId) {
      try {
        const audioUrl = await CloudStorageService.saveAIAudio(audioBuffer, conversationId, messageId)
        if (audioUrl) {
          return NextResponse.json({ audioUrl })
        }
      } catch (error) {
        console.error("Error saving audio to S3:", error)
        // Fall back to returning audio directly
      }
    }

    // Return the audio data with proper headers (fallback or direct request)
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Text-to-speech error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
