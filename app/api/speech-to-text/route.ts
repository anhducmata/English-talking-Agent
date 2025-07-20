import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null
    const inputLanguage = formData.get("language") as string | null // Get language from formData

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Build multipart body for OpenAI Whisper
    const openAIForm = new FormData()
    openAIForm.append("file", audioFile, audioFile.name || "audio.webm")
    openAIForm.append("model", "whisper-1")

    // Set language if provided, to improve accuracy
    if (inputLanguage) {
      openAIForm.append("language", inputLanguage)
    }

    // Add a prompt if the input language is English, to hint at Vietnamese accent
    // The prompt should be in the same language as the audio input.
    if (inputLanguage === "en") {
      openAIForm.append("prompt", "This is a conversation with a Vietnamese speaker practicing English.")
    }

    const openAIRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        // Content-Type is set automatically when FormData is used
      },
      body: openAIForm,
    })

    if (!openAIRes.ok) {
      const err = await openAIRes.json().catch(() => ({}))
      console.error("OpenAI Whisper error: ", err)
      return NextResponse.json(
        { error: err?.error?.message ?? "Failed to transcribe audio" },
        { status: openAIRes.status },
      )
    }

    const { text } = (await openAIRes.json()) as { text: string }
    return NextResponse.json({ text })
  } catch (e) {
    console.error("Speech-to-text route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
