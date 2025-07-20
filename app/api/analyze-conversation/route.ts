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

    // Calculate speaking metrics
    const userMessages = conversation.filter((msg: any) => msg.role === "user")
    const totalWords = userMessages.reduce((sum: number, msg: any) => {
      return sum + msg.content.split(" ").filter((word: string) => word.length > 0).length
    }, 0)

    // Estimate speaking time (average 150 words per minute)
    const estimatedSpeakingSeconds = Math.round((totalWords / 150) * 60)
    const idealSpeakingSeconds = Math.round(timeLimit * 60 * 0.4) // 40% of total time should be student speaking

    // Calculate length bonus but cap final score at 100
    const lengthBonus = Math.min(estimatedSpeakingSeconds / idealSpeakingSeconds, 1.2)

    // Create conversation text for analysis
    const conversationText = conversation
      .map((msg: any) => `${msg.role === "user" ? "Student" : "AI Teacher"}: ${msg.content}`)
      .join("\n")

    // Update the system prompt to include the new scoring methodology
    const systemPrompt =
      language === "vi"
        ? `Bạn là một chuyên gia đánh giá tiếng Anh chuyên nghiệp. Phân tích cuộc hội thoại luyện tập và áp dụng công thức chấm điểm sau:

CÔNG THỨC CHẤM ĐIỂM:
raw_score = base_score × length_bonus
final_score = min(raw_score, 100) // Giới hạn tối đa 100 điểm

Base Score (0-100):
base_score = (fluency × 0.25) + (pronunciation × 0.25) + (grammar × 0.20) + (vocabulary × 0.15) + (content_richness × 0.15)

Length Bonus (tối đa 1.2):
length_bonus = min(speaking_seconds / ideal_seconds, 1.2)

TIÊU CHUẨN ĐÁNH GIÁ THEO ĐỘ KHÓ:
Độ khó ${difficulty}/5 - Kỳ vọng:
- Độ khó 1 (Cơ bản): Kỳ vọng 40-60 điểm
- Độ khó 2 (Sơ cấp): Kỳ vọng 50-70 điểm  
- Độ khó 3 (Trung cấp): Kỳ vọng 60-80 điểm
- Độ khó 4 (Khá): Kỳ vọng 70-85 điểm
- Độ khó 5 (Nâng cao): Kỳ vọng 80-95 điểm

THÔNG TIN PHIÊN:
- Tổng từ của học sinh: ${totalWords} từ
- Thời gian nói ước tính: ${estimatedSpeakingSeconds} giây
- Thời gian nói lý tưởng: ${idealSpeakingSeconds} giây
- Length Bonus: ${lengthBonus.toFixed(2)}

Đánh giá từng thành phần (0-100):
- Fluency (Lưu loát): Khả năng nói mượt mà, tự nhiên
- Pronunciation (Phát âm): Độ chính xác phát âm (ước tính từ văn bản)
- Grammar (Ngữ pháp): Độ chính xác ngữ pháp
- Vocabulary (Từ vựng): Sự phong phú và chính xác của từ vựng
- Content Richness (Nội dung phong phú): Độ sâu và chi tiết của nội dung

Chủ đề: ${topic}
Độ khó: ${difficulty}/5
Thời gian: ${timeLimit} phút
QUAN TRỌNG: Chỉ phân tích và đưa ra gợi ý cho tin nhắn của HỌC SINH. Không đưa ra gợi ý cho phản hồi của AI Giáo viên.`
        : `You are a professional English assessment expert. Analyze this practice conversation and apply the following scoring formula:

SCORING FORMULA:
raw_score = base_score × length_bonus
final_score = min(raw_score, 100) // Capped at 100 points maximum

Base Score (0-100):
base_score = (fluency × 0.25) + (pronunciation × 0.25) + (grammar × 0.20) + (vocabulary × 0.15) + (content_richness × 0.15)

Length Bonus (max 1.2):
length_bonus = min(speaking_seconds / ideal_seconds, 1.2)

DIFFICULTY-BASED EXPECTATIONS:
Difficulty ${difficulty}/5 - Expected Performance:
- Level 1 (Beginner): Expected 40-60 points
- Level 2 (Elementary): Expected 50-70 points
- Level 3 (Intermediate): Expected 60-80 points
- Level 4 (Upper-Intermediate): Expected 70-85 points
- Level 5 (Advanced): Expected 80-95 points

SESSION INFO:
- Student total words: ${totalWords} words
- Estimated speaking time: ${estimatedSpeakingSeconds} seconds
- Ideal speaking time: ${idealSpeakingSeconds} seconds
- Length Bonus: ${lengthBonus.toFixed(2)}

Evaluate each component (0-100):
- Fluency: Smoothness and naturalness of speech flow
- Pronunciation: Accuracy of pronunciation (estimated from text)
- Grammar: Grammatical accuracy and correctness
- Vocabulary: Richness and accuracy of vocabulary usage
- Content Richness: Depth and detail of content provided

Topic: ${topic}
Difficulty: ${difficulty}/5
Duration: ${timeLimit} minutes
IMPORTANT: Only analyze and provide suggestions for the STUDENT's messages. Do not provide suggestions for the AI Teacher's responses.`

    // Update the user prompt to include the new scoring format
    const userPrompt =
      language === "vi"
        ? `Phân tích cuộc hội thoại sau và trả về JSON với format (tất cả nội dung phải bằng tiếng Việt):
{
  "componentScores": {
    "fluency": number (0-100),
    "pronunciation": number (0-100),
    "grammar": number (0-100),
    "vocabulary": number (0-100),
    "contentRichness": number (0-100)
  },
  "baseScore": number (0-100),
  "lengthBonus": number (tối đa 1.2),
  "rawScore": number (base_score × length_bonus),
  "finalScore": number (0-100, giới hạn tối đa 100),
  "expectationScore": number (1-10, dựa trên độ khó ${difficulty}),
  "metExpectations": boolean (có đạt kỳ vọng theo độ khó không),
  "speakingMetrics": {
    "totalWords": ${totalWords},
    "estimatedSeconds": ${estimatedSpeakingSeconds},
    "idealSeconds": ${idealSpeakingSeconds},
    "speakingRatio": number (estimatedSeconds/idealSeconds)
  },
  "strengths": [
    "điểm mạnh về ngữ pháp bằng tiếng Việt",
    "điểm mạnh về từ vựng bằng tiếng Việt", 
    "điểm mạnh về giao tiếp bằng tiếng Việt"
  ],
  "improvements": [
    "cần cải thiện ngữ pháp bằng tiếng Việt",
    "cần cải thiện từ vựng bằng tiếng Việt",
    "cần cải thiện phát âm/lưu loát bằng tiếng Việt"
  ],
  "feedback": "nhận xét chi tiết về khả năng giao tiếp tổng thể bằng tiếng Việt",
  "suggestions": [
    {
      "type": "sentence" | "vocabulary" | "grammar" | "expression",
      "original": "câu gốc hoặc từ gốc của học sinh",
      "alternative": "câu thay thế hoặc từ thay thế tốt hơn",
      "explanation": "giải thích tại sao thay thế này tốt hơn",
      "category": "Grammar" | "Vocabulary" | "Natural Expression" | "Pronunciation Guide"
    }
  ]
}

Áp dụng công thức chấm điểm và đánh giá expectationScore dựa trên độ khó:
- Độ khó 1: expectationScore 6-8 nếu đạt 40-60 điểm
- Độ khó 2: expectationScore 6-8 nếu đạt 50-70 điểm
- Độ khó 3: expectationScore 6-8 nếu đạt 60-80 điểm
- Độ khó 4: expectationScore 6-8 nếu đạt 70-85 điểm
- Độ khó 5: expectationScore 6-8 nếu đạt 80-95 điểm

Cung cấp tối đa 10 gợi ý trong mảng suggestions.
Chỉ tập trung gợi ý cho tin nhắn của học sinh (role: 'user'), bỏ qua tin nhắn của AI giáo viên.

Cuộc hội thoại:
${conversationText}`
        : `Analyze the following conversation and return JSON in this format (all content must be in English):
{
  "componentScores": {
    "fluency": number (0-100),
    "pronunciation": number (0-100),
    "grammar": number (0-100),
    "vocabulary": number (0-100),
    "contentRichness": number (0-100)
  },
  "baseScore": number (0-100),
  "lengthBonus": number (max 1.2),
  "rawScore": number (base_score × length_bonus),
  "finalScore": number (0-100, capped at 100),
  "expectationScore": number (1-10, based on difficulty ${difficulty}),
  "metExpectations": boolean (whether expectations for difficulty level were met),
  "speakingMetrics": {
    "totalWords": ${totalWords},
    "estimatedSeconds": ${estimatedSpeakingSeconds},
    "idealSeconds": ${idealSpeakingSeconds},
    "speakingRatio": number (estimatedSeconds/idealSeconds)
  },
  "strengths": [
    "grammar strength in English",
    "vocabulary strength in English", 
    "communication strength in English"
  ],
  "improvements": [
    "grammar improvement needed in English",
    "vocabulary improvement needed in English",
    "pronunciation/fluency improvement needed in English"
  ],
  "feedback": "detailed feedback on overall communication abilities in English",
  "suggestions": [
    {
      "type": "sentence" | "vocabulary" | "grammar" | "expression",
      "original": "student's original phrase or word",
      "alternative": "better alternative phrase or word",
      "explanation": "why this alternative is better",
      "category": "Grammar" | "Vocabulary" | "Natural Expression" | "Pronunciation Guide"
    }
  ]
}

Apply the scoring formula and evaluate expectationScore based on difficulty:
- Level 1: expectationScore 6-8 if achieving 40-60 points
- Level 2: expectationScore 6-8 if achieving 50-70 points
- Level 3: expectationScore 6-8 if achieving 60-80 points
- Level 4: expectationScore 6-8 if achieving 70-85 points
- Level 5: expectationScore 6-8 if achieving 80-95 points

Provide up to 10 suggestions in the suggestions array.
Focus suggestions only on student messages (role: 'user'), ignore AI teacher messages.

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
        max_tokens: 1500, // Increased for more detailed analysis
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

      // Calculate fallback scores using the formula
      const baseScore = 70 // Default base score
      const rawScore = baseScore * lengthBonus
      const finalScore = Math.min(rawScore, 100)

      // Calculate expectation score based on difficulty
      const getExpectationScore = (finalScore: number, difficulty: number) => {
        const expectedRanges = [
          [40, 60], // Level 1
          [50, 70], // Level 2
          [60, 80], // Level 3
          [70, 85], // Level 4
          [80, 95], // Level 5
        ]
        const [minExpected, maxExpected] = expectedRanges[difficulty - 1] || [60, 80]

        if (finalScore >= minExpected && finalScore <= maxExpected) {
          return Math.round(6 + ((finalScore - minExpected) / (maxExpected - minExpected)) * 2) // 6-8 range
        } else if (finalScore > maxExpected) {
          return Math.min(10, 8 + Math.round((finalScore - maxExpected) / 10)) // Above expectations
        } else {
          return Math.max(1, Math.round((finalScore / minExpected) * 6)) // Below expectations
        }
      }

      const expectationScore = getExpectationScore(finalScore, difficulty)

      // Return a comprehensive fallback analysis with new scoring format
      return NextResponse.json({
        componentScores: {
          fluency: 70,
          pronunciation: 70,
          grammar: 70,
          vocabulary: 70,
          contentRichness: 70,
        },
        baseScore: baseScore,
        lengthBonus: lengthBonus,
        rawScore: rawScore,
        finalScore: finalScore,
        expectationScore: expectationScore,
        metExpectations: expectationScore >= 6,
        speakingMetrics: {
          totalWords: totalWords,
          estimatedSeconds: estimatedSpeakingSeconds,
          idealSeconds: idealSpeakingSeconds,
          speakingRatio: estimatedSpeakingSeconds / idealSpeakingSeconds,
        },
        strengths: [
          language === "en" ? "Good participation in conversation" : "Tham gia hội thoại tích cực",
          language === "en" ? "Shows effort in communication" : "Thể hiện nỗ lực giao tiếp",
          language === "en" ? "Attempts to use varied vocabulary" : "Cố gắng sử dụng từ vựng đa dạng",
        ],
        improvements: [
          language === "en" ? "Focus on grammar accuracy" : "Tập trung vào độ chính xác ngữ pháp",
          language === "en" ? "Expand vocabulary range" : "Mở rộng vốn từ vựng",
          language === "en" ? "Work on natural expression" : "Cải thiện cách diễn đạt tự nhiên",
        ],
        feedback:
          language === "en"
            ? "Great job practicing! You show good communication skills and willingness to engage. Continue working on accuracy and fluency to improve further."
            : "Bạn đã luyện tập rất tốt! Bạn thể hiện kỹ năng giao tiếp tốt và sự tích cực tham gia. Hãy tiếp tục cải thiện độ chính xác và sự lưu loát.",
        suggestions: [
          {
            type: "sentence",
            original: language === "en" ? "Example phrase" : "Ví dụ câu nói",
            alternative: language === "en" ? "Better alternative" : "Cách nói tốt hơn",
            explanation: language === "en" ? "This sounds more natural" : "Cách này nghe tự nhiên hơn",
            category: "Natural Expression",
          },
          {
            type: "vocabulary",
            original: language === "en" ? "Basic word" : "Từ cơ bản",
            alternative: language === "en" ? "Advanced alternative" : "Từ nâng cao thay thế",
            explanation: language === "en" ? "More sophisticated vocabulary" : "Từ vựng tinh tế hơn",
            category: "Vocabulary",
          },
        ],
      })
    }
  } catch (e) {
    console.error("Analysis route error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
