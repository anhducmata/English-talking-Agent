import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/text-to-speech
 * Body: { text: string; voice?: string }
 *
 * Forwards the request to OpenAI TTS and returns an MP3 buffer.
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure the API key exists
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not set. Add it to your Vercel project or .env file.",
        },
        { status: 500 },
      )
    }
    const { text, voice = "alloy" } = (await req.json()) as {
      text?: string
      voice?: string
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const openAIRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        // IMPORTANT: Ask OpenAI for mp3 audio back
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice,
        // You may set "format": "mp3" explicitly (optional; mp3 is default)
        // Additional params such as `speed` or `style` can be added here.
      }),
    })

    if (!openAIRes.ok) {
      // Bubble up OpenAI error message for easier debugging
      const err = await openAIRes.json().catch(() => ({}))
      console.error("OpenAI TTS error: ", err)
      return NextResponse.json(
        { error: err?.error?.message ?? "Failed to generate speech" },
        { status: openAIRes.status },
      )
    }

    // Binary audio comes back in the body
    const audioArrayBuffer = await openAIRes.arrayBuffer()

    return new NextResponse(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        // Let the browser know it's a downloadable/stream-able audio file
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    })
  } catch (e) {
    console.error("Text-to-speech route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
