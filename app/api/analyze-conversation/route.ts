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

    const { conversation, topic, difficulty, timeLimit, language } = await req.json()

    // Create conversation text for analysis
    const conversationText = conversation
      .map((msg: any) => `${msg.role === "user" ? "Student" : "AI Teacher"}: ${msg.content}`)
      .join("\n")

    // Update the system prompt to generate Vietnamese analysis when requested
    const systemPrompt =
      language === "vi"
        ? `Bạn là một chuyên gia đánh giá tiếng Anh. Phân tích cuộc hội thoại luyện tập và đưa ra điểm số cụ thể bằng tiếng Việt.

Tiêu chí đánh giá:
- Trình độ tiếng Anh tổng thể (1-10)
- Mức độ đạt mong đợi so với chủ đề và độ khó (1-10)
- Điểm mạnh cụ thể (bằng tiếng Việt)
- Điểm cần cải thiện (bằng tiếng Việt)
- Nhận xét chi tiết (bằng tiếng Việt)
- Gợi ý cải thiện: chọn 2-3 câu của học sinh và đưa ra cách diễn đạt tốt hơn

Chủ đề: ${topic}
Độ khó: ${difficulty}/5
Thời gian: ${timeLimit} phút`
        : `You are an English assessment expert. Analyze this practice conversation and provide specific scores in English.

Assessment criteria:
- Overall English proficiency (1-10)
- How well expectations were met for the topic and difficulty (1-10)
- Specific strengths (in English)
- Areas for improvement (in English)
- Detailed feedback (in English)
- Improvement suggestions: select 2-3 student phrases and provide better alternatives

Topic: ${topic}
Difficulty: ${difficulty}/5
Duration: ${timeLimit} minutes`

    // Update the user prompt to specify language for analysis content
    const userPrompt =
      language === "vi"
        ? `Phân tích cuộc hội thoại sau và trả về JSON với format (tất cả nội dung phải bằng tiếng Việt):
{
  "overallScore": number (1-10),
  "expectationScore": number (1-10),
  "strengths": ["điểm mạnh 1 bằng tiếng Việt", "điểm mạnh 2 bằng tiếng Việt"],
  "improvements": ["cần cải thiện 1 bằng tiếng Việt", "cần cải thiện 2 bằng tiếng Việt"],
  "feedback": "nhận xét chi tiết bằng tiếng Việt",
  "suggestions": [
    {
      "original": "câu gốc của học sinh",
      "alternative": "câu thay thế tốt hơn",
      "explanation": "giải thích tại sao câu thay thế tốt hơn"
    }
  ]
}

Cuộc hội thoại:
${conversationText}`
        : `Analyze the following conversation and return JSON in this format (all content must be in English):
{
  "overallScore": number (1-10),
  "expectationScore": number (1-10),
  "strengths": ["strength 1 in English", "strength 2 in English"],
  "improvements": ["improvement 1 in English", "improvement 2 in English"],
  "feedback": "detailed feedback in English",
  "suggestions": [
    {
      "original": "student's original phrase",
      "alternative": "better alternative phrase",
      "explanation": "why the alternative is better"
    }
  ]
}

Conversation:
${conversationText}`

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!openAIRes.ok) {
      const err = await openAIRes.json().catch(() => ({}))
      console.error("OpenAI Analysis error: ", err)
      return NextResponse.json(
        { error: err?.error?.message ?? "Failed to analyze conversation" },
        { status: openAIRes.status },
      )
    }

    const result = await openAIRes.json()
    const analysisText = result.choices[0]?.message?.content || "{}"

    try {
      // --- clean possible markdown fences ---------------------------------
      let cleaned = analysisText.trim()
      if (cleaned.startsWith("```")) {
        // remove first line (\`\`\`json or \`\`\`)
        const firstBreak = cleaned.indexOf("\n")
        const lastFence = cleaned.lastIndexOf("```")
        cleaned = cleaned.slice(firstBreak + 1, lastFence).trim()
      }

      const analysis = JSON.parse(cleaned)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error("Failed to parse analysis JSON:", parseError)
      // Return a fallback analysis
      return NextResponse.json({
        overallScore: 7,
        expectationScore: 7,
        strengths: [language === "en" ? "Good participation" : "Tham gia tích cực"],
        improvements: [language === "en" ? "Continue practicing" : "Tiếp tục luyện tập"],
        feedback:
          language === "en"
            ? "Great job practicing! Keep up the good work."
            : "Bạn đã luyện tập rất tốt! Hãy tiếp tục phát huy.",
        suggestions: [
          {
            original: language === "en" ? "Example phrase" : "Ví dụ câu nói",
            alternative: language === "en" ? "Better alternative" : "Cách nói tốt hơn",
            explanation: language === "en" ? "This sounds more natural" : "Cách này nghe tự nhiên hơn",
          },
        ],
      })
    }
  } catch (e) {
    console.error("Analysis route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
