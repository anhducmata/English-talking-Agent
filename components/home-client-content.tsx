"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, Sparkles, Clock, Target, Volume2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface HomeClientContentProps {
  userEmail: string
}

export function HomeClientContent({ userEmail }: HomeClientContentProps) {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [topic, setTopic] = useState("")
  const [timeLimit, setTimeLimit] = useState([10])
  const [difficulty, setDifficulty] = useState([3])
  const [voice, setVoice] = useState("alloy")
  const [isGenerating, setIsGenerating] = useState(false)

  const translations = {
    en: {
      welcome: "Welcome back!",
      subtitle: "Ready to practice your English conversation skills?",
      topicLabel: "What would you like to talk about?",
      topicPlaceholder: "Enter a topic or let AI suggest one...",
      generateTopic: "Generate Topic",
      timeLimitLabel: "Time Limit",
      minutes: "minutes",
      difficultyLabel: "Difficulty Level",
      voiceLabel: "AI Voice",
      startPractice: "Start Practice Session",
      difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"],
      voiceOptions: {
        alloy: "Alloy (Neutral)",
        echo: "Echo (Male)",
        fable: "Fable (British)",
        onyx: "Onyx (Deep)",
        nova: "Nova (Female)",
        shimmer: "Shimmer (Soft)",
      },
    },
    vi: {
      welcome: "Chào mừng trở lại!",
      subtitle: "Sẵn sàng luyện tập kỹ năng hội thoại tiếng Anh?",
      topicLabel: "Bạn muốn nói về chủ đề gì?",
      topicPlaceholder: "Nhập chủ đề hoặc để AI gợi ý...",
      generateTopic: "Tạo Chủ Đề",
      timeLimitLabel: "Giới Hạn Thời Gian",
      minutes: "phút",
      difficultyLabel: "Mức Độ Khó",
      voiceLabel: "Giọng Nói AI",
      startPractice: "Bắt Đầu Luyện Tập",
      difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
      voiceOptions: {
        alloy: "Alloy (Trung tính)",
        echo: "Echo (Nam)",
        fable: "Fable (Anh)",
        onyx: "Onyx (Trầm)",
        nova: "Nova (Nữ)",
        shimmer: "Shimmer (Nhẹ nhàng)",
      },
    },
  }

  const t = translations[language]

  const generateTopic = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: difficulty[0],
          language: language,
        }),
      })
      const data = await response.json()
      setTopic(data.topic)
    } catch (error) {
      console.error("Error generating topic:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const startPractice = () => {
    if (!topic.trim()) return

    const params = new URLSearchParams({
      topic: topic.trim(),
      timeLimit: timeLimit[0].toString(),
      difficulty: difficulty[0].toString(),
      voice,
      language,
    })

    router.push(`/practice?${params.toString()}`)
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
    <main className="container mx-auto px-6 py-12 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {t.welcome}
          </h2>
          <p className="text-xl text-gray-400 font-medium">{t.subtitle}</p>
        </div>

        {/* Main Setup Card */}
        <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Practice Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t.topicLabel}
              </label>
              <div className="flex gap-3">
                <Textarea
                  placeholder={t.topicPlaceholder}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white resize-none"
                  rows={3}
                />
                <Button
                  onClick={generateTopic}
                  disabled={isGenerating}
                  variant="outline"
                  className="px-4 border-gray-700 bg-gray-900 text-white hover:bg-gray-800 hover:border-gray-600 shrink-0"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="ml-2 hidden sm:inline">{t.generateTopic}</span>
                </Button>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time Limit */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t.timeLimitLabel}
                </label>
                <div className="space-y-3">
                  <Slider value={timeLimit} onValueChange={setTimeLimit} max={30} min={5} step={5} className="w-full" />
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-gray-800 text-white">
                      {timeLimit[0]} {t.minutes}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300">{t.difficultyLabel}</label>
                <div className="space-y-3">
                  <Slider
                    value={difficulty}
                    onValueChange={setDifficulty}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <Badge className={getDifficultyColor(difficulty[0])}>{t.difficultyLevels[difficulty[0] - 1]}</Badge>
                  </div>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {t.voiceLabel}
                </label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(t.voiceOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={startPractice}
                disabled={!topic.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {t.startPractice}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
