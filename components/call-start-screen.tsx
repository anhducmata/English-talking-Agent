"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, MessageCircle, Mic, Briefcase, Clock, Globe } from "lucide-react"
import type { InterviewData } from "./interview-prep-modal"

export interface CallStartScreenProps {
  topic: string
  difficulty: number
  actualTimeLimit: number
  language: "en" | "vi"
  onStartCall: () => void
  mode: "casual-chat" | "speaking-practice" | "interview"
  interviewData?: InterviewData | null
}

const translations = {
  en: {
    readyToStart: "Ready to Start",
    startConversation: "Start Conversation",
    topic: "Topic",
    difficulty: "Difficulty",
    timeLimit: "Time Limit",
    language: "Language",
    minutes: "minutes",
    modes: {
      "casual-chat": "Casual Chat",
      "speaking-practice": "Speaking Practice",
      interview: "Interview Simulation",
    },
    modeDescriptions: {
      "casual-chat": "Have a natural, relaxed conversation without formal analysis",
      "speaking-practice": "Practice with feedback and corrections to improve your English",
      interview: "Simulate a professional interview with relevant questions",
    },
    interviewDetails: "Interview Details",
    position: "Position",
    company: "Company",
    experience: "Experience",
    difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"],
  },
  vi: {
    readyToStart: "Sẵn Sàng Bắt Đầu",
    startConversation: "Bắt Đầu Hội Thoại",
    topic: "Chủ Đề",
    difficulty: "Độ Khó",
    timeLimit: "Thời Gian",
    language: "Ngôn Ngữ",
    minutes: "phút",
    modes: {
      "casual-chat": "Trò Chuyện Thường Ngày",
      "speaking-practice": "Luyện Tập Nói",
      interview: "Mô Phỏng Phỏng Vấn",
    },
    modeDescriptions: {
      "casual-chat": "Có một cuộc trò chuyện tự nhiên, thoải mái mà không cần phân tích chính thức",
      "speaking-practice": "Luyện tập với phản hồi và sửa lỗi để cải thiện tiếng Anh của bạn",
      interview: "Mô phỏng một cuộc phỏng vấn chuyên nghiệp với các câu hỏi liên quan",
    },
    interviewDetails: "Chi Tiết Phỏng Vấn",
    position: "Vị Trí",
    company: "Công Ty",
    experience: "Kinh Nghiệm",
    difficultyLevels: ["Mới Bắt Đầu", "Cơ Bản", "Trung Cấp", "Trung Cấp Cao", "Nâng Cao"],
  },
}

const modeIcons = {
  "casual-chat": MessageCircle,
  "speaking-practice": Mic,
  interview: Briefcase,
}

export function CallStartScreen({
  topic,
  difficulty,
  actualTimeLimit,
  language,
  onStartCall,
  mode,
  interviewData,
}: CallStartScreenProps) {
  const t = translations[language]
  const ModeIcon = modeIcons[mode] || MessageCircle

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 text-white">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t.readyToStart}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <ModeIcon className="w-5 h-5" />
              <span className="text-lg">{t.modes[mode]}</span>
            </div>
            <p className="text-sm text-gray-400">{t.modeDescriptions[mode]}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.topic}</p>
                  <p className="font-medium">{topic}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.timeLimit}</p>
                  <p className="font-medium">
                    {actualTimeLimit} {t.minutes}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.difficulty}</p>
                  <p className="font-medium">{t.difficultyLevels[difficulty - 1] || "Intermediate"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">{t.language}</p>
                  <p className="font-medium">{language === "en" ? "English" : "Tiếng Việt"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          {mode === "interview" && interviewData && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t.interviewDetails}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">{t.position}</p>
                  <p className="font-medium">{interviewData.jobTitle}</p>
                </div>
                {interviewData.company && (
                  <div>
                    <p className="text-gray-400">{t.company}</p>
                    <p className="font-medium">{interviewData.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">{t.experience}</p>
                  <p className="font-medium">{interviewData.experienceLevel}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={onStartCall}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              {t.startConversation}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
