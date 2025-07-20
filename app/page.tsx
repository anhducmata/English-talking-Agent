"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Mic, Play, Settings, Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EnglishPracticeUI() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [timeLimit, setTimeLimit] = useState("1")
  const [difficulty, setDifficulty] = useState("1")
  const [voice, setVoice] = useState("alloy")
  const [prompt, setPrompt] = useState("")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  const translations = {
    en: {
      title: "English Practice",
      subtitle: "AI-powered conversation training",
      promptLabel: "Conversation Topic",
      promptPlaceholder:
        "Enter your topic... e.g., 'Restaurant ordering', 'Job interview prep', 'Travel conversations'",
      timeLimit: "Time",
      difficulty: "Level",
      difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Int", "Advanced"],
      voiceSelection: "Voice",
      voiceOptions: {
        alloy: "Alloy (Neutral)",
        echo: "Echo (Male)",
        fable: "Fable (British)",
        onyx: "Onyx (Deep)",
        nova: "Nova (Female)",
        shimmer: "Shimmer (Soft)",
      },
      startPractice: "Start Practice",
      settings: "Settings",
    },
    vi: {
      title: "Luyện Tiếng Anh",
      subtitle: "Hội thoại AI thông minh",
      promptLabel: "Chủ Đề Hội Thoại",
      promptPlaceholder: "Nhập chủ đề... VD: 'Đặt món nhà hàng', 'Phỏng vấn xin việc', 'Hội thoại du lịch'",
      timeLimit: "Thời gian",
      difficulty: "Cấp độ",
      difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
      voiceSelection: "Giọng",
      voiceOptions: {
        alloy: "Alloy (Trung tính)",
        echo: "Echo (Nam)",
        fable: "Fable (Anh)",
        onyx: "Onyx (Trầm)",
        nova: "Nova (Nữ)",
        shimmer: "Shimmer (Nhẹ nhàng)",
      },
      startPractice: "Bắt Đầu",
      settings: "Cài Đặt",
    },
  }

  const getTimeOptions = (lang: "en" | "vi") => [
    { value: "1", label: lang === "en" ? "1 min" : "1 phút" },
    { value: "2", label: lang === "en" ? "2 min" : "2 phút" },
    { value: "3", label: lang === "en" ? "3 min" : "3 phút" },
    { value: "4", label: lang === "en" ? "5 min" : "5 phút" },
    { value: "5", label: lang === "en" ? "8 min" : "8 phút" },
    { value: "6", label: lang === "en" ? "10 min" : "10 phút" },
  ]

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("englishPracticeSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setLanguage(settings.language || "en")
        setTimeLimit(settings.timeLimit || "1")
        setDifficulty(settings.difficulty || "1")
        setVoice(settings.voice || "alloy")
        setPrompt(settings.prompt || "")
      } catch (error) {
        console.error("Error loading settings from localStorage:", error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      language,
      timeLimit,
      difficulty,
      voice,
      prompt,
    }
    localStorage.setItem("englishPracticeSettings", JSON.stringify(settings))
  }, [language, timeLimit, difficulty, voice, prompt])

  const generateStructuredPrompt = async () => {
    if (!prompt.trim()) {
      const basicTopic = language === "en" ? "General English Conversation" : "Hội thoại tiếng Anh tổng quát"
      setPrompt(basicTopic)
      return
    }

    setIsGeneratingPrompt(true)
    try {
      const timeValue = [1, 2, 3, 5, 8, 10][Number.parseInt(timeLimit) - 1]
      const difficultyLevel = t.difficultyLevels[Number.parseInt(difficulty) - 1]

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: prompt,
          timeLimit: timeValue,
          difficulty: difficultyLevel,
          language: language,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPrompt(result.structuredPrompt)
      } else {
        console.error("Failed to generate prompt")
      }
    } catch (error) {
      console.error("Error generating prompt:", error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const t = translations[language]
  const timeOptions = getTimeOptions(language)

  const handleStartPractice = () => {
    const params = new URLSearchParams({
      topic: prompt,
      timeLimit: timeLimit,
      difficulty: difficulty,
      voice: voice,
      language: language,
    })

    router.push(`/practice?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden">
      {/* Animated Flying Character Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flying character 1 */}
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -left-1 -right-1 top-3 h-0.5 bg-white rounded-full animate-pulse delay-100"></div>
          </div>
        </div>

        {/* Flying character 2 */}
        <div className="absolute animate-[fly2_25s_linear_infinite] opacity-10">
          <div className="w-6 h-6 bg-gray-400 rounded-full relative">
            <div className="absolute -left-1.5 -right-1.5 top-1 h-0.5 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            <div className="absolute -left-1 -right-1 top-2.5 h-0.5 bg-gray-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Flying character 3 */}
        <div className="absolute animate-[fly3_30s_linear_infinite] opacity-10">
          <div className="w-10 h-10 bg-white rounded-full relative">
            <div className="absolute -left-3 -right-3 top-2 h-1 bg-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute -left-2 -right-2 top-4 h-0.5 bg-white rounded-full animate-pulse delay-600"></div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute animate-[float1_15s_ease-in-out_infinite] opacity-20">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
        <div className="absolute animate-[float2_18s_ease-in-out_infinite] opacity-20">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <div className="absolute animate-[float3_22s_ease-in-out_infinite] opacity-20">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t.title}</h1>
                <p className="text-sm text-gray-400 font-medium">{t.subtitle}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              className="gap-2 text-sm font-semibold h-10 px-4 border-2 border-gray-700 bg-black text-white hover:bg-gray-900 hover:border-gray-600 transition-all duration-200"
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "VI" : "EN"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-4xl space-y-6">
        {/* Prompt Input with Integrated Settings */}
        <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-black" />
              </div>
              {t.promptLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="relative">
              <Textarea
                placeholder={t.promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[160px] text-sm leading-relaxed resize-none border-2 border-gray-800 focus:border-white bg-black text-white placeholder:text-gray-500 font-medium pr-14 rounded-xl transition-all duration-200"
              />
              <Button
                onClick={generateStructuredPrompt}
                size="sm"
                variant="outline"
                disabled={isGeneratingPrompt}
                className="absolute top-3 right-3 h-10 w-10 p-0 border-2 border-gray-700 hover:border-white bg-black text-white hover:bg-gray-900 rounded-lg transition-all duration-200"
                title={language === "en" ? "Generate structured prompt with AI" : "Tạo prompt có cấu trúc bằng AI"}
              >
                {isGeneratingPrompt ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>

            {/* Integrated Settings */}
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center gap-4">
                

                <div className="flex gap-4 flex-1 items-stretch justify-center">
                  {/* Time Limit */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{t.timeLimit}</span>
                    <Select value={timeLimit} onValueChange={setTimeLimit}>
                      <SelectTrigger className="h-8 text-xs font-medium border-0 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 focus:ring-1 focus:ring-white/20 transition-all duration-200 w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-0 bg-gray-800/95 backdrop-blur-md shadow-2xl max-h-none overflow-visible">
                        {timeOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-xs font-medium text-white hover:bg-gray-700/80 hover:text-white focus:bg-gray-700/80 focus:text-white rounded-md transition-colors duration-150"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{t.difficulty}</span>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-8 text-xs font-medium border-0 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 focus:ring-1 focus:ring-white/20 transition-all duration-200 w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-0 bg-gray-800/95 backdrop-blur-md shadow-2xl max-h-none overflow-visible">
                        {t.difficultyLevels.map((level, index) => (
                          <SelectItem
                            key={index + 1}
                            value={(index + 1).toString()}
                            className="text-xs font-medium text-white hover:bg-gray-700/80 hover:text-white focus:bg-gray-700/80 focus:text-white rounded-md transition-colors duration-150"
                          >
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{t.voiceSelection}</span>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger className="h-8 text-xs font-medium border-0 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 focus:ring-1 focus:ring-white/20 transition-all duration-200 w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-0 bg-gray-800/95 backdrop-blur-md shadow-2xl max-h-none overflow-visible">
                        {Object.entries(t.voiceOptions).map(([key, value]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-xs font-medium text-white hover:bg-gray-700/80 hover:text-white focus:bg-gray-700/80 focus:text-white rounded-md transition-colors duration-150"
                          >
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button - Centered */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartPractice}
            size="default"
            className="w-auto h-10 px-6 text-sm font-bold bg-white text-black hover:bg-gray-200 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg"
            disabled={!prompt.trim() || !voice}
          >
            <Play className="w-4 h-4 mr-2" />
            {t.startPractice}
          </Button>
        </div>
      </div>

      <style jsx>{`
      @keyframes fly1 {
        0% { transform: translate(-100px, 20vh) rotate(0deg); }
        25% { transform: translate(25vw, 10vh) rotate(90deg); }
        50% { transform: translate(50vw, 30vh) rotate(180deg); }
        75% { transform: translate(75vw, 15vh) rotate(270deg); }
        100% { transform: translate(calc(100vw + 100px), 25vh) rotate(360deg); }
      }
      
      @keyframes fly2 {
        0% { transform: translate(calc(100vw + 100px), 60vh) rotate(180deg); }
        25% { transform: translate(75vw, 70vh) rotate(270deg); }
        50% { transform: translate(50vw, 50vh) rotate(360deg); }
        75% { transform: translate(25vw, 80vh) rotate(450deg); }
        100% { transform: translate(-100px, 65vh) rotate(540deg); }
      }
      
      @keyframes fly3 {
        0% { transform: translate(-100px, 40vh) rotate(0deg); }
        33% { transform: translate(33vw, 80vh) rotate(120deg); }
        66% { transform: translate(66vw, 20vh) rotate(240deg); }
        100% { transform: translate(calc(100vw + 100px), 60vh) rotate(360deg); }
      }
      
      @keyframes float1 {
        0%, 100% { transform: translate(10vw, 20vh) translateY(0px); }
        50% { transform: translate(15vw, 25vh) translateY(-20px); }
      }
      
      @keyframes float2 {
        0%, 100% { transform: translate(80vw, 70vh) translateY(0px); }
        50% { transform: translate(85vw, 65vh) translateY(-15px); }
      }
      
      @keyframes float3 {
        0%, 100% { transform: translate(60vw, 90vh) translateY(0px); }
        50% { transform: translate(65vw, 85vh) translateY(-25px); }
      }
    `}</style>
    </div>
  )
}
