import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    console.log("Speech-to-text request received:", {
      hasAudioFile: !!audioFile,
      audioFileSize: audioFile?.size,
      audioFileType: audioFile?.type,
      language,
    })

    if (!audioFile) {
      console.error("No audio file provided in request")
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Check file size (OpenAI has a 25MB limit)
    const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > MAX_FILE_SIZE) {
      console.error("Audio file too large:", audioFile.size)
      return NextResponse.json({ error: "Audio file too large. Maximum size is 25MB." }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Convert audio file to a format OpenAI can process
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })

    // Create FormData for OpenAI API
    const openaiFormData = new FormData()
    openaiFormData.append("file", audioBlob, "audio.webm")
    openaiFormData.append("model", "whisper-1")

    // Set language parameter for OpenAI
    const openaiLanguage = language === "vi" ? "vi" : "en"
    openaiFormData.append("language", openaiLanguage)

    // Optional: Add response format
    openaiFormData.append("response_format", "json")

    console.log("Calling OpenAI Whisper API with:", {
      model: "whisper-1",
      language: openaiLanguage,
      fileSize: audioFile.size,
      fileType: audioFile.type,
    })

    // Call OpenAI Whisper API directly
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    })

    console.log("OpenAI API response status:", response.status)
    console.log("OpenAI API response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      // Return more specific error messages based on status code
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 500 })
      } else if (response.status === 413) {
        return NextResponse.json({ error: "Audio file too large" }, { status: 400 })
      } else if (response.status === 400) {
        return NextResponse.json({ error: "Invalid audio format or request" }, { status: 400 })
      } else {
        return NextResponse.json(
          {
            error: "Speech-to-text service temporarily unavailable",
            details: response.status >= 500 ? "Server error" : "Client error",
          },
          { status: 500 },
        )
      }
    }

    const result = await response.json()
    console.log("OpenAI API success response:", {
      hasText: !!result.text,
      textLength: result.text?.length,
    })

    return NextResponse.json({
      text: result.text || "",
    })
  } catch (error) {
    console.error("Speech-to-text error:", error)

    // More specific error handling
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      // Handle specific error types
      if (error.message.includes("fetch")) {
        return NextResponse.json(
          {
            error: "Network error connecting to speech service",
          },
          { status: 500 },
        )
      } else if (error.message.includes("JSON")) {
        return NextResponse.json(
          {
            error: "Invalid response from speech service",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error in speech processing",
      },
      { status: 500 },
    )
  }
}
