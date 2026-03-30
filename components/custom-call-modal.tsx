"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Sparkles } from "lucide-react"

interface CustomCallModalProps {
  isOpen: boolean
  onClose: () => void
  onStartCall: (config: CustomCallConfig) => void
  language: "en" | "vi"
  initialConfig?: CustomCallConfig
}

export interface CustomCallConfig {
  topic: string
  goal: string
  rules: string
  expectations: string
  timeLimit: string
  voice: string
  conversationMode: string
  difficulty?: number
}

const translations = {
  en: {
    myOwnTopic: "My Own Topic",
    whatToTalk: "What do you want to talk about?",
    topicPlaceholder: "e.g., My favorite video game, How to make pizza, Talking to aliens...",
    difficulty: "How hard should it be?",
    difficultyHint: "Easy = simple words, Hard = tricky words!",
    easy: "Easy (1)",
    medium: "Medium (3)",
    hard: "Hard (5)",
    startChat: "Let's Chat!",
  },
  vi: {
    myOwnTopic: "Chủ Đề Của Tôi",
    whatToTalk: "Bạn muốn nói về điều gì?",
    topicPlaceholder: "ví dụ: Trò chơi video yêu thích, Cách làm bánh pizza, Nói chuyện với người ngoài hành tinh...",
    difficulty: "Nó khó như thế nào?",
    difficultyHint: "Dễ = từ đơn giản, Khó = từ phức tạp!",
    easy: "Dễ (1)",
    medium: "Trung bình (3)",
    hard: "Khó (5)",
    startChat: "Bắt đầu trò chuyện!",
  },
}

const defaultConfig: CustomCallConfig = {
  topic: "",
  goal: "",
  rules: "",
  expectations: "",
  timeLimit: "5",
  voice: "shimmer",
  conversationMode: "casual-chat",
  difficulty: 3,
}

export function CustomCallModal({
  isOpen,
  onClose,
  onStartCall,
  language,
  initialConfig,
}: CustomCallModalProps) {
  const [config, setConfig] = useState<CustomCallConfig>(defaultConfig)
  const [difficulty, setDifficulty] = useState(3)

  const t = translations[language]

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
      setDifficulty(initialConfig.difficulty || 3)
    } else {
      setConfig(defaultConfig)
      setDifficulty(3)
    }
  }, [initialConfig, isOpen])

  const handleStartCall = () => {
    if (config.topic.trim()) {
      onStartCall({
        ...config,
        difficulty,
        goal: `I want to practice English by talking about: ${config.topic}. Difficulty level: ${difficulty}/5`,
        rules: "Be enthusiastic, ask follow-up questions, and make this fun!",
        expectations: "I should feel confident talking about this topic and learn new words.",
      })
      onClose()
    }
  }

  const handleClose = () => {
    setConfig(defaultConfig)
    setDifficulty(3)
    onClose()
  }

  const difficultyLabels = [
    { value: 1, label: t.easy },
    { value: 3, label: t.medium },
    { value: 5, label: t.hard },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-sky-50 to-violet-50 border-2 border-sky-200 shadow-lg rounded-3xl p-0 text-gray-900">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {t.myOwnTopic}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0 hover:bg-white/20">
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Topic Input */}
          <div>
            <Label className="text-sm font-bold text-gray-800 mb-2 block flex items-center gap-2">
              🎯 {t.whatToTalk}
            </Label>
            <Input
              type="text"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              placeholder={t.topicPlaceholder}
              className="w-full bg-white border-2 border-sky-200 focus:border-violet-400 focus:ring-0 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 font-medium text-sm"
            />
          </div>

          {/* Difficulty Slider */}
          <div>
            <Label className="text-sm font-bold text-gray-800 mb-1 block flex items-center gap-2">
              ⚡ {t.difficulty}
            </Label>
            <p className="text-xs text-gray-600 mb-3">{t.difficultyHint}</p>

            {/* Slider */}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 rounded-full appearance-none cursor-pointer slider"
            />

            {/* Label below slider */}
            <div className="flex justify-between mt-2 text-xs font-semibold text-gray-700">
              {difficultyLabels.map((d) => (
                <span
                  key={d.value}
                  className={`px-3 py-1 rounded-full transition-all ${
                    difficulty === d.value
                      ? "bg-violet-500 text-white scale-105"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-center bg-gradient-to-r from-sky-50 to-violet-50 border-t border-sky-200 rounded-b-3xl">
          <Button
            onClick={handleStartCall}
            disabled={!config.topic.trim()}
            className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-white px-8 py-3 rounded-2xl font-extrabold text-base h-auto shadow-lg shadow-emerald-400/50 hover:shadow-xl hover:shadow-emerald-400/60 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {t.startChat}
          </Button>
        </div>

        {/* CSS for custom slider styling */}
        <style>{`
          input[type="range"].slider::-webkit-slider-thumb {
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            border: 3px solid #9333ea;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }

          input[type="range"].slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            border: 3px solid #9333ea;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
