"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Mic, Briefcase } from "lucide-react"

interface ModeSelectorProps {
  mode: "casual-chat" | "speaking-practice" | "interview"
  onModeChange: (mode: "casual-chat" | "speaking-practice" | "interview") => void
  language: "en" | "vi"
  disabled?: boolean
}

const translations = {
  en: {
    modes: {
      "casual-chat": "Casual Chat",
      "speaking-practice": "Speaking Practice",
      interview: "Interview Simulation",
    },
  },
  vi: {
    modes: {
      "casual-chat": "Trò Chuyện Thường Ngày",
      "speaking-practice": "Luyện Tập Nói",
      interview: "Mô Phỏng Phỏng Vấn",
    },
  },
}

const modeIcons = {
  "casual-chat": MessageCircle,
  "speaking-practice": Mic,
  interview: Briefcase,
}

export function ModeSelector({ mode, onModeChange, language, disabled = false }: ModeSelectorProps) {
  const t = translations[language]
  const CurrentIcon = modeIcons[mode]

  return (
    <Select value={mode} onValueChange={onModeChange} disabled={disabled}>
      <SelectTrigger className="w-48 h-8 bg-gray-900 border-gray-700 text-white text-xs">
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-3 h-3" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700">
        <SelectItem value="casual-chat" className="text-white hover:bg-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3 h-3" />
            {t.modes["casual-chat"]}
          </div>
        </SelectItem>
        <SelectItem value="speaking-practice" className="text-white hover:bg-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <Mic className="w-3 h-3" />
            {t.modes["speaking-practice"]}
          </div>
        </SelectItem>
        <SelectItem value="interview" className="text-white hover:bg-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3" />
            {t.modes["interview"]}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
