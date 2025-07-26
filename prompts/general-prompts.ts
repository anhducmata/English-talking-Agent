export interface AnalysisConfig {
  mode: "speaking-practice" | "casual-chat" | "interview"
  language: "en" | "vi"
  topic: string
}

export function generateAnalysisSystemPrompt(config: AnalysisConfig): string {
  const { mode, language, topic } = config

  const analysisInstructions = {
    en: {
      "speaking-practice": `You are an English language assessment expert analyzing a speaking practice conversation about ${topic}.

Analyze the conversation and provide:
1. Overall speaking score (1-10)
2. Strengths in speaking ability
3. Areas for improvement
4. Specific feedback on grammar, vocabulary, and fluency
5. Recommendations for further practice

Focus on constructive feedback that helps improve English speaking skills.`,

      "casual-chat": `You are an English conversation assessment expert analyzing a casual chat about ${topic}.

Analyze the conversation and provide:
1. Overall communication score (1-10)
2. Strengths in natural conversation
3. Areas for improvement in casual communication
4. Feedback on engagement and flow
5. Suggestions for better conversational skills

Focus on natural communication and conversational confidence.`,

      interview: `You are a professional interview assessment expert analyzing an interview about ${topic}.

Analyze the interview performance and provide:
1. Overall interview score (1-10)
2. Strengths demonstrated during the interview
3. Areas needing improvement
4. Feedback on professional communication
5. Recommendations for interview preparation

Focus on professional communication and interview readiness.`,
    },
    vi: {
      "speaking-practice": `Bạn là chuyên gia đánh giá ngôn ngữ tiếng Anh phân tích cuộc trò chuyện luyện tập nói về ${topic}.

Phân tích cuộc trò chuyện và cung cấp:
1. Điểm nói tổng thể (1-10)
2. Điểm mạnh trong khả năng nói
3. Các lĩnh vực cần cải thiện
4. Phản hồi cụ thể về ngữ pháp, từ vựng và độ trưng
5. Khuyến nghị cho việc luyện tập thêm

Tập trung vào phản hồi xây dựng giúp cải thiện kỹ năng nói tiếng Anh.`,

      "casual-chat": `Bạn là chuyên gia đánh giá hội thoại tiếng Anh phân tích cuộc trò chuyện thường ngày về ${topic}.

Phân tích cuộc trò chuyện và cung cấp:
1. Điểm giao tiếp tổng thể (1-10)
2. Điểm mạnh trong hội thoại tự nhiên
3. Các lĩnh vực cần cải thiện trong giao tiếp thường ngày
4. Phản hồi về sự tham gia và dòng chảy
5. Gợi ý cho kỹ năng hội thoại tốt hơn

Tập trung vào giao tiếp tự nhiên và sự tự tin trong hội thoại.`,

      interview: `Bạn là chuyên gia đánh giá phỏng vấn chuyên nghiệp phân tích cuộc phỏng vấn về ${topic}.

Phân tích hiệu suất phỏng vấn và cung cấp:
1. Điểm phỏng vấn tổng thể (1-10)
2. Điểm mạnh được thể hiện trong cuộc phỏng vấn
3. Các lĩnh vực cần cải thiện
4. Phản hồi về giao tiếp chuyên nghiệp
5. Khuyến nghị cho việc chuẩn bị phỏng vấn

Tập trung vào giao tiếp chuyên nghiệp và sự sẵn sàng phỏng vấn.`,
    },
  }

  return `${analysisInstructions[language][mode]}

Provide your analysis in valid JSON format with the following structure:
{
  "mode": "${mode}",
  "overallScore": number,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "detailedFeedback": {
    "grammar": "feedback on grammar usage",
    "vocabulary": "feedback on vocabulary range and accuracy",
    "fluency": "feedback on speaking fluency and pace",
    "pronunciation": "feedback on pronunciation clarity"
  },
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Ensure the response is valid JSON without any additional text or formatting.`
}

export function cleanJsonResponse(response: string): string {
  try {
    // Remove any markdown code blocks
    let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "")

    // Find the first { and last } to extract JSON
    const firstBrace = cleaned.indexOf("{")
    const lastBrace = cleaned.lastIndexOf("}")

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }

    // Try to parse the cleaned JSON
    JSON.parse(cleaned)
    return cleaned
  } catch (error) {
    console.error("JSON cleanup failed:", error)

    // Fallback: try to extract JSON using regex
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0])
        return jsonMatch[0]
      } catch (e) {
        console.error("Regex extraction failed:", e)
      }
    }

    // Return a default valid JSON structure
    return JSON.stringify({
      mode: "speaking-practice",
      overallScore: 5,
      strengths: ["Attempted communication", "Showed engagement", "Participated actively"],
      improvements: ["Continue practicing", "Focus on clarity", "Build confidence"],
      detailedFeedback: {
        grammar: "Keep practicing basic grammar structures",
        vocabulary: "Expand vocabulary through regular reading",
        fluency: "Practice speaking regularly to improve flow",
        pronunciation: "Focus on clear pronunciation of key sounds",
      },
      recommendations: ["Practice daily", "Record yourself speaking", "Join conversation groups"],
    })
  }
}

export const analysisFallbacks = {
  en: {
    "speaking-practice": {
      mode: "speaking-practice",
      overallScore: 6,
      strengths: ["Active participation", "Clear communication intent", "Willingness to practice"],
      improvements: ["Grammar accuracy", "Vocabulary expansion", "Speaking confidence"],
      detailedFeedback: {
        grammar: "Focus on basic sentence structures and verb tenses",
        vocabulary: "Expand vocabulary through daily reading and practice",
        fluency: "Practice speaking regularly to improve natural flow",
        pronunciation: "Work on clear pronunciation of common sounds",
      },
      recommendations: [
        "Practice speaking daily",
        "Record yourself for self-assessment",
        "Join English conversation groups",
      ],
    },
    "casual-chat": {
      mode: "casual-chat",
      overallScore: 6,
      strengths: ["Natural conversation flow", "Good engagement", "Comfortable communication"],
      improvements: ["Vocabulary variety", "Expression confidence", "Topic development"],
      detailedFeedback: {
        grammar: "Generally good grammar with minor errors",
        vocabulary: "Use more varied vocabulary to express ideas",
        fluency: "Good conversational pace with natural pauses",
        pronunciation: "Clear pronunciation with good comprehension",
      },
      recommendations: [
        "Practice diverse topics",
        "Expand conversational vocabulary",
        "Engage in more casual conversations",
      ],
    },
    interview: {
      mode: "interview",
      overallScore: 6,
      strengths: ["Professional demeanor", "Clear responses", "Good preparation"],
      improvements: ["Answer structure", "Professional vocabulary", "Confidence building"],
      detailedFeedback: {
        grammar: "Use more complex sentence structures for professional communication",
        vocabulary: "Incorporate more professional and technical vocabulary",
        fluency: "Practice smooth delivery of prepared responses",
        pronunciation: "Focus on clear articulation for professional settings",
      },
      recommendations: [
        "Practice common interview questions",
        "Develop STAR method responses",
        "Mock interview sessions",
      ],
    },
  },
  vi: {
    "speaking-practice": {
      mode: "speaking-practice",
      overallScore: 6,
      strengths: ["Tham gia tích cực", "Ý định giao tiếp rõ ràng", "Sẵn sàng luyện tập"],
      improvements: ["Độ chính xác ngữ pháp", "Mở rộng từ vựng", "Tự tin khi nói"],
      detailedFeedback: {
        grammar: "Tập trung vào cấu trúc câu cơ bản và thì động từ",
        vocabulary: "Mở rộng từ vựng thông qua đọc và luyện tập hàng ngày",
        fluency: "Luyện nói thường xuyên để cải thiện độ trôi chảy tự nhiên",
        pronunciation: "Làm việc trên phát âm rõ ràng các âm phổ biến",
      },
      recommendations: ["Luyện nói hàng ngày", "Ghi âm bản thân để tự đánh giá", "Tham gia nhóm hội thoại tiếng Anh"],
    },
    "casual-chat": {
      mode: "casual-chat",
      overallScore: 6,
      strengths: ["Dòng chảy hội thoại tự nhiên", "Tham gia tốt", "Giao tiếp thoải mái"],
      improvements: ["Đa dạng từ vựng", "Tự tin biểu đạt", "Phát triển chủ đề"],
      detailedFeedback: {
        grammar: "Ngữ pháp tổng thể tốt với lỗi nhỏ",
        vocabulary: "Sử dụng từ vựng đa dạng hơn để diễn đạt ý tưởng",
        fluency: "Tốc độ hội thoại tốt với tạm dừng tự nhiên",
        pronunciation: "Phát âm rõ ràng với khả năng hiểu tốt",
      },
      recommendations: [
        "Luyện tập các chủ đề đa dạng",
        "Mở rộng từ vựng hội thoại",
        "Tham gia nhiều cuộc trò chuyện thường ngày hơn",
      ],
    },
    interview: {
      mode: "interview",
      overallScore: 6,
      strengths: ["Thái độ chuyên nghiệp", "Phản hồi rõ ràng", "Chuẩn bị tốt"],
      improvements: ["Cấu trúc câu trả lời", "Từ vựng chuyên nghiệp", "Xây dựng sự tự tin"],
      detailedFeedback: {
        grammar: "Sử dụng cấu trúc câu phức tạp hơn cho giao tiếp chuyên nghiệp",
        vocabulary: "Kết hợp nhiều từ vựng chuyên nghiệp và kỹ thuật hơn",
        fluency: "Luyện tập truyền đạt mượt mà các phản hồi đã chuẩn bị",
        pronunciation: "Tập trung vào phát âm rõ ràng cho môi trường chuyên nghiệp",
      },
      recommendations: [
        "Luyện tập câu hỏi phỏng vấn phổ biến",
        "Phát triển phản hồi theo phương pháp STAR",
        "Các buổi phỏng vấn thử",
      ],
    },
  },
}
