"use client"

import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

interface CallStartScreenProps {
  topic: string
  difficulty: number
  actualTimeLimit: number
  language: "en" | "vi"
  onStartCall: () => void
}

const translations = {
  en: {
    readyToStart: "Ready to Practice?",
    startDescription: "Click to start your conversation practice session",
    startCall: "Start Call",
    difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Int", "Advanced"],
  },
  vi: {
    readyToStart: "Sẵn Sàng Luyện Tập?",
    startDescription: "Nhấn để bắt đầu buổi luyện tập hội thoại",
    startCall: "Bắt Đầu Cuộc Gọi",
    difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
  },
}

export function CallStartScreen({ topic, difficulty, actualTimeLimit, language, onStartCall }: CallStartScreenProps) {
  const t = translations[language]

  const extractTopicTitle = (fullTopic: string) => {
    if (fullTopic.includes("# ") && fullTopic.includes(" - Speaking Practice")) {
      const titleLine = fullTopic.split("\n")[0]
      return titleLine.replace("# ", "").replace(" - Speaking Practice", "")
    }
    return fullTopic.length > 50 ? fullTopic.substring(0, 50) + "..." : fullTopic
  }

  const getDifficultyColor = (level: number) => {
    const colors = [
      "bg-emerald-100 text-emerald-800",
      "bg-yellow-100 text-yellow-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800",
    ]
    return colors[level - 1] || colors[0]
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
          <Phone className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-xl font-bold">{t.readyToStart}</h2>
        <p className="text-sm text-gray-400">{t.startDescription}</p>

        <div className="space-y-2 text-xs">
          <div className="text-xs text-gray-400 font-semibold">
            <span className="text-gray-500">{language === "en" ? "Topic" : "Nội dung"}:</span>{" "}
            <span className="text-emerald-400 font-bold">{extractTopicTitle(topic)}</span>
          </div>
          <div className="text-xs text-gray-400 font-semibold">
            <span className="text-gray-500">{language === "en" ? "Level" : "Trình độ"}:</span>{" "}
            <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(difficulty)}`}>
              {t.difficultyLevels[difficulty - 1]}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-semibold">
            <span className="text-gray-500">{language === "en" ? "Duration" : "Thời gian"}:</span>{" "}
            <span className="text-white font-bold">
              {actualTimeLimit} {language === "en" ? "minutes" : "phút"}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onStartCall}
        size="lg"
        className="h-16 px-8 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full"
      >
        <Phone className="w-6 h-6 mr-3" />
        {t.startCall}
      </Button>
    </div>
  )
}
