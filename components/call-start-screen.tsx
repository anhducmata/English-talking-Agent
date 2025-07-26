"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Target, MessageSquare, Briefcase, User, Building, Calendar } from "lucide-react"
import type { InterviewData } from "@/components/interview-prep-modal"

const translations = {
  en: {
    readyToStart: "Ready to Start",
    topic: "Topic",
    difficulty: "Difficulty",
    timeLimit: "Time Limit",
    minutes: "minutes",
    startCall: "Start Call",
    casualChat: "Casual Chat",
    speakingPractice: "Speaking Practice",
    interview: "Interview",
    interviewDetails: "Interview Details",
    position: "Position",
    company: "Company",
    experienceLevel: "Experience Level",
    interviewType: "Interview Type",
    difficultyLevels: {
      1: "Beginner",
      2: "Elementary",
      3: "Intermediate",
      4: "Advanced",
      5: "Expert",
    },
  },
  vi: {
    readyToStart: "Sẵn Sàng Bắt Đầu",
    topic: "Chủ Đề",
    difficulty: "Độ Khó",
    timeLimit: "Thời Gian",
    minutes: "phút",
    startCall: "Bắt Đầu Cuộc Gọi",
    casualChat: "Trò Chuyện Thường",
    speakingPractice: "Luyện Nói",
    interview: "Phỏng Vấn",
    interviewDetails: "Chi Tiết Phỏng Vấn",
    position: "Vị Trí",
    company: "Công Ty",
    experienceLevel: "Cấp Độ Kinh Nghiệm",
    interviewType: "Loại Phỏng Vấn",
    difficultyLevels: {
      1: "Người Mới",
      2: "Cơ Bản",
      3: "Trung Bình",
      4: "Nâng Cao",
      5: "Chuyên Gia",
    },
  },
}

interface CallStartScreenProps {
  topic: string
  difficulty: number
  actualTimeLimit: number
  language: "en" | "vi"
  onStartCall: () => void
  mode: "casual-chat" | "speaking-practice" | "interview"
  interviewData?: InterviewData | null
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

  const getModeIcon = () => {
    switch (mode) {
      case "casual-chat":
        return <MessageSquare className="w-5 h-5 text-blue-400" />
      case "speaking-practice":
        return <Target className="w-5 h-5 text-green-400" />
      case "interview":
        return <Briefcase className="w-5 h-5 text-purple-400" />
      default:
        return <MessageSquare className="w-5 h-5 text-blue-400" />
    }
  }

  const getModeTitle = () => {
    switch (mode) {
      case "casual-chat":
        return t.casualChat
      case "speaking-practice":
        return t.speakingPractice
      case "interview":
        return t.interview
      default:
        return t.speakingPractice
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getModeIcon()}
            <Badge variant="outline" className="text-white border-gray-600">
              {getModeTitle()}
            </Badge>
          </div>
          <CardTitle className="text-2xl text-white">{t.readyToStart}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">{t.topic}</div>
              <div className="text-white font-medium">{topic}</div>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">{t.difficulty}</div>
              <div className="text-white font-medium">
                {t.difficultyLevels[difficulty as keyof typeof t.difficultyLevels]}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">{t.timeLimit}</div>
              <div className="text-white font-medium">
                {actualTimeLimit} {t.minutes}
              </div>
            </div>
          </div>

          {/* Interview Details */}
          {mode === "interview" && interviewData && (
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  {t.interviewDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">{t.position}</div>
                      <div className="text-white text-sm">{interviewData.position}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">{t.company}</div>
                      <div className="text-white text-sm">{interviewData.company}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">{t.experienceLevel}</div>
                      <div className="text-white text-sm">{interviewData.experienceLevel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">{t.interviewType}</div>
                      <div className="text-white text-sm">{interviewData.interviewType}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Button */}
          <div className="text-center pt-4">
            <Button
              onClick={onStartCall}
              size="lg"
              className="bg-white hover:bg-gray-200 text-black px-8 py-3 text-lg font-medium"
            >
              <Play className="w-5 h-5 mr-2" />
              {t.startCall}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
