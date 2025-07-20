import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set. Add it to your Vercel project or .env file." },
        { status: 500 },
      )
    }

    const { messages, topic, difficulty, language } = await req.json()

    // Check if this is the initial greeting
    const isInitialGreeting = messages.length === 1 && messages[0].content.includes("Can you start our conversation")

    // Create system prompt based on topic and settings
    const systemPrompt =
      language === "vi"
        ? `Bạn là một người bản ngữ tiếng Anh đang tham gia vào tình huống thực tế: "${topic}".

Hướng dẫn quan trọng:
- KHÔNG giải thích hay dẫn nhập gì cả
- Hành động như một người thật trong tình huống "${topic}"
- Bắt đầu cuộc hội thoại một cách tự nhiên như ngoài đời
- Trình độ học sinh: ${difficulty}/5 - điều chỉnh ngôn ngữ cho phù hợp
- Tạo tình huống thực tế, không phải bài học
- Nói chuyện ngắn gọn, tự nhiên (1-2 câu)
- Đóng vai người trong tình huống đó (nhân viên, bạn bè, đồng nghiệp, v.v.)

Ví dụ cho "${topic}":
- Nếu là "Restaurant ordering": "Hi there! Welcome to our restaurant. What can I get you today?"
- Nếu là "Job interview": "Good morning! Please have a seat. Tell me a bit about yourself."
- Nếu là "Shopping": "Good afternoon! Can I help you find anything today?"`
        : `You are a native English speaker participating in a real-life situation: "${topic}".

Important guidelines:
- DO NOT explain or introduce anything
- Act like a real person in the "${topic}" situation
- Start the conversation naturally like in real life
- Student level: ${difficulty}/5 - adjust language accordingly
- Create realistic scenarios, not lessons
- Keep responses short and natural (1-2 sentences)
- Play the role of someone in that situation (staff, friend, colleague, etc.)

Examples for "${topic}":
- If "Restaurant ordering": "Hi there! Welcome to our restaurant. What can I get you today?"
- If "Job interview": "Good morning! Please have a seat. Tell me a bit about yourself."
- If "Shopping": "Good afternoon! Can I help you find anything today?"`

    let finalMessages = messages

    // If it's the initial greeting, replace it with a natural scenario starter
    if (isInitialGreeting) {
      finalMessages = [
        {
          role: "user",
          content: `Start a natural conversation for the scenario: ${topic}. Act as the appropriate person in this situation.`,
        },
      ]
    }

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...finalMessages],
        max_tokens: 100,
        temperature: 0.8,
      }),
    })

    if (!openAIRes.ok) {
      const err = await openAIRes.json().catch(() => ({}))
      console.error("OpenAI Chat error: ", err)
      return NextResponse.json(
        { error: err?.error?.message ?? "Failed to generate response" },
        { status: openAIRes.status },
      )
    }

    const result = await openAIRes.json()
    const aiMessage = result.choices[0]?.message?.content || "I'm sorry, I didn't understand that."

    return NextResponse.json({ message: aiMessage })
  } catch (e) {
    console.error("Chat route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
