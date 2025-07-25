"use client"

import { Clock, MoveLeft } from "lucide-react"
import { ModeSelector } from "./mode-selector"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PracticeHeaderProps {
  timeRemaining: number
  language: "en" | "vi"
  mode: "casual-chat" | "speaking-practice" | "interview"
  onModeChange: (mode: "casual-chat" | "speaking-practice" | "interview") => void
  isCallActive: boolean
}

const translations = {
  en: {
    timeRemaining: "Time Remaining",
    backToSettings: "Back to Settings",
  },
  vi: {
    timeRemaining: "Thời Gian Còn Lại",
    backToSettings: "Quay Lại Cài Đặt",
  },
}

export function PracticeHeader({ timeRemaining, language, mode, onModeChange, isCallActive }: PracticeHeaderProps) {
  const t = translations[language]
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const router = useRouter()

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white hover:bg-transparent"
          >
            <MoveLeft className="w-4 h-4 mr-1" />
            {t.backToSettings}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{t.timeRemaining}:</span>
          <span className="text-lg font-mono">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}
