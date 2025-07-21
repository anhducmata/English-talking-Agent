"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PracticeHeaderProps {
  timeRemaining: number
  language: "en" | "vi"
}

const translations = {
  en: {
    backToSetup: "Back to Setup",
    practiceSession: "Practice Session",
    timeRemaining: "Time Remaining",
  },
  vi: {
    backToSetup: "Quay Lại Cài Đặt",
    practiceSession: "Buổi Luyện Tập",
    timeRemaining: "Thời Gian Còn Lại",
  },
}

export function PracticeHeader({ timeRemaining, language }: PracticeHeaderProps) {
  const router = useRouter()
  const t = translations[language]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <header className="border-b border-gray-800 bg-black/90 backdrop-blur-xl sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 text-gray-300 hover:text-white font-bold text-xs tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToSetup}
          </Button>

          <div className="text-center flex-1 max-w-md">
            <h1 className="text-base font-bold">{t.practiceSession}</h1>
          </div>

          <div className="text-xs font-bold text-gray-300 text-right">
            <div>{t.timeRemaining}</div>
            <div className="text-emerald-400">{formatTime(timeRemaining)}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
