"use client"

import { Clock, MoveLeft, Zap, Radio } from "lucide-react"
import { ModeSelector } from "./mode-selector"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PracticeHeaderProps {
  timeRemaining: number
  language: "en" | "vi"
  mode: "casual-chat" | "speaking-practice" | "interview"
  onModeChange: (mode: "casual-chat" | "speaking-practice" | "interview") => void
  isCallActive: boolean
  useRealtimeMode?: boolean
  onRealtimeModeChange?: (enabled: boolean) => void
  onOpenLessonBuilder?: () => void
  onOpenCustomCallModal?: (config: any, promptData?: any) => void
  onOpenInterviewPrepModal?: () => void
}

const translations = {
  en: {
    timeRemaining: "Time Remaining",
    backToSettings: "Back to Settings",
    realtimeMode: "Realtime",
    legacyMode: "Standard",
  },
  vi: {
    timeRemaining: "Thoi Gian Con Lai",
    backToSettings: "Quay Lai Cai Dat",
    realtimeMode: "Thoi gian thuc",
    legacyMode: "Chuan",
  },
}

export function PracticeHeader({ 
  timeRemaining, 
  language, 
  mode, 
  onModeChange, 
  isCallActive,
  useRealtimeMode = true,
  onRealtimeModeChange,
}: PracticeHeaderProps) {
  const t = translations[language]
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const router = useRouter()

  return (
    <div className="bg-card border-b-2 border-primary/20 px-6 py-3 shadow-sm">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-primary/10 font-medium"
          >
            <MoveLeft className="w-4 h-4 mr-1" />
            {t.backToSettings}
          </Button>
          
          {/* Realtime Mode Toggle */}
          {!isCallActive && onRealtimeModeChange && (
            <div className="flex items-center gap-2 ml-4 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
              <Radio className={`w-4 h-4 ${!useRealtimeMode ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
              <Switch 
                id="realtime-mode"
                checked={useRealtimeMode}
                onCheckedChange={onRealtimeModeChange}
                className="data-[state=checked]:bg-success"
              />
              <Zap className={`w-4 h-4 ${useRealtimeMode ? 'text-success' : 'text-muted-foreground/50'}`} />
              <Label 
                htmlFor="realtime-mode" 
                className={`text-sm font-semibold cursor-pointer ${useRealtimeMode ? 'text-success' : 'text-muted-foreground'}`}
              >
                {useRealtimeMode ? t.realtimeMode : t.legacyMode}
              </Label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 bg-accent/30 px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-semibold text-foreground">{t.timeRemaining}:</span>
          <span className="text-xl font-bold text-foreground tabular-nums">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}
