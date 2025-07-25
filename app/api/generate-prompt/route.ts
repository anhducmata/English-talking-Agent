import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set. Add it to your Vercel project or .env file." },
        { status: 500 },
      )
    }

    const { topic, timeLimit, difficulty, language, mode, interviewContext } = await req.json()

    let prompt = ""
    if (mode === "interview" && interviewContext) {
      prompt = `Generate a detailed interview scenario for a ${interviewContext.experienceLevel} ${interviewContext.jobTitle} position at ${interviewContext.company || "a company"}. Include potential questions and expected answers. The interview should last approximately ${timeLimit} minutes. The language for the interview should be ${language === "en" ? "English" : "Vietnamese"}.`
    } else {
      const currentDate = new Date().toISOString().split("T")[0]

      const systemPrompt =
        language === "vi"
          ? `Bạn là một chuyên gia thiết kế chương trình học tiếng Anh. Hãy tạo một prompt có cấu trúc chi tiết cho buổi luyện tập hội thoại.

Yêu cầu:
- Tạo mục tiêu học tập cụ thể và thực tế cho chủ đề "${topic}"
- Phù hợp với trình độ "${difficulty}"
- Thời gian luyện tập: ${timeLimit} phút
- Đưa ra các bài tập và hoạt động cụ thể
- Tạo tiêu chí đánh giá rõ ràng`
          : `You are an expert English learning curriculum designer. Create a detailed structured prompt for a conversation practice session.

Requirements:
- Create specific and realistic learning goals for the topic "${topic}"
- Appropriate for "${difficulty}" level
- Practice duration: ${timeLimit} minutes
- Provide specific exercises and activities
- Create clear evaluation criteria`

      const userPrompt =
        language === "vi"
          ? `Tạo một prompt có cấu trúc cho buổi luyện tập với format sau:

# ${topic} - Speaking Practice

**Session Info:**
- User: anhducmata
- Date: ${currentDate}
- Duration: ${timeLimit} minutes
- Goal: [Mục tiêu cụ thể cho người học]

**Time Breakdown:**
- Prep: 10% of time
- Practice: 70% of time  
- Review: 20% of time

**Practice Flow:**
1. Topic introduction
2. Core speaking exercises on ${topic}
3. Goal-focused practice for [mục tiêu cụ thể]
4. Self-evaluation

**Output Tracking:**
- Achievement level: ___/10
- Strengths noted:
- Next focus area:

Hãy điền vào các phần [mục tiêu cụ thể] với nội dung phù hợp với chủ đề và trình độ.`
          : `Create a structured prompt for the practice session using this format:

# ${topic} - Speaking Practice

**Session Info:**
- User: anhducmata
- Date: ${currentDate}
- Duration: ${timeLimit} minutes
- Goal: [Specific learning objective for the user]

**Time Breakdown:**
- Prep: 10% of time
- Practice: 70% of time  
- Review: 20% of time

**Practice Flow:**
1. Topic introduction
2. Core speaking exercises on ${topic}
3. Goal-focused practice for [specific objective]
4. Self-evaluation

**Output Tracking:**
- Achievement level: ___/10
- Strengths noted:
- Next focus area:

Please fill in the [specific learning objective] parts with content appropriate for the topic and difficulty level.`

      prompt = `Generate a conversation prompt for an English language practice session.
      Topic: ${topic}
      Difficulty: ${difficulty} (1-5, 1 being easiest, 5 being hardest)
      Time Limit: ${timeLimit} minutes
      Language: ${language === "en" ? "English" : "Vietnamese"}
      Mode: ${mode === "casual-chat" ? "Casual Chat" : "Speaking Practice"}

      The prompt should be a short scenario or a starting question to kick off the conversation.
      For 'Speaking Practice' mode, the prompt should encourage detailed responses and opportunities for feedback.
      For 'Casual Chat' mode, the prompt should be open-ended and natural.
      `
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    return NextResponse.json({ prompt: text })
  } catch (e) {
    console.error("Generate prompt route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
