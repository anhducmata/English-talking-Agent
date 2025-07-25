import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Create FormData for OpenAI API
    const openaiFormData = new FormData()
    openaiFormData.append("file", audioFile)
    openaiFormData.append("model", "whisper-1")
    openaiFormData.append("language", language === "vi" ? "vi" : "en")

    // Call OpenAI Whisper API directly
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", response.status, errorText)
      return NextResponse.json({ error: "Speech-to-text conversion failed" }, { status: response.status })
    }

    const result = await response.json()

    return NextResponse.json({
      text: result.text || "",
    })
  } catch (error) {
    console.error("Speech-to-text error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
