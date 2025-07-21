"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Settings, Check, Sparkles } from "lucide-react"
import { CustomCallModal, type CustomCallConfig } from "@/components/custom-call-modal"
import { AiLessonBuilderModal } from "@/components/ai-lesson-builder-modal"

const translations = {
  en: {
    title: "SpeakEasy",
    subtitle: "Practice English with AI conversations",
    startPractice: "Start Practice!",
    choosePracticeStyle: "Choose your practice style",
    quickCall: "Quick Call",
    quickCallDescription: "General English Conversation",
    advanced: "Advanced",
    advancedDescription: "Create your own lesson",
    aiLessonBuilder: "AI Lesson Builder",
    aiLessonBuilderDescription: "AI creates lesson from your topic",
    selectOption: "Please select a practice option to continue",
  },
  vi: {
    title: "SpeakEasy",
    subtitle: "Luyện tập tiếng Anh với cuộc trò chuyện AI",
    startPractice: "Bắt Đầu Luyện Tập!",
    choosePracticeStyle: "Chọn phong cách luyện tập của bạn",
    quickCall: "Cuộc Gọi Nhanh",
    quickCallDescription: "Hội thoại tiếng Anh tổng quát",
    advanced: "Nâng Cao",
    advancedDescription: "Tạo bài học của riêng bạn",
    aiLessonBuilder: "Trình Tạo Bài Học AI",
    aiLessonBuilderDescription: "AI tạo bài học từ chủ đề của bạn",
    selectOption: "Vui lòng chọn một tùy chọn luyện tập để tiếp tục",
  },
}

export default function HomePage() {
  const [language] = useState<"en" | "vi">("en")
  const [selectedOption, setSelectedOption] = useState<"quick" | "advanced" | "ai-builder" | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [showAiBuilderModal, setShowAiBuilderModal] = useState(false)
  const [customModalInitialConfig, setCustomModalInitialConfig] = useState<CustomCallConfig | undefined>(undefined)
  const [aiPromptData, setAiPromptData] = useState<
    | {
        rawTopic: string
        conversationMode: string
        voice: string
        timeLimit: string
      }
    | undefined
  >(undefined)
  const router = useRouter()

  const t = translations[language]

  const handleQuickCall = () => {
    // Navigate directly to practice with default settings
    const searchParams = new URLSearchParams({
      topic: "General English Conversation",
      timeLimit: "5",
      voice: "alloy",
      difficulty: "intermediate",
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleCustomCall = (config: CustomCallConfig) => {
    // Navigate to practice with custom settings
    const searchParams = new URLSearchParams({
      topic: config.topic,
      goal: config.goal,
      rules: config.rules,
      expectations: config.expectations,
      timeLimit: config.timeLimit,
      voice: config.voice,
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleOpenCustomModalWithConfig = (
    config: CustomCallConfig,
    promptData?: {
      rawTopic: string
      conversationMode: string
      voice: string
      timeLimit: string
    },
  ) => {
    setCustomModalInitialConfig(config)
    setAiPromptData(promptData)
    setShowCustomModal(true)
  }

  const handleBackToAiBuilder = () => {
    setShowCustomModal(false)
    setShowAiBuilderModal(true)
  }

  const handleStartPractice = () => {
    if (selectedOption === "quick") {
      handleQuickCall()
    } else if (selectedOption === "advanced") {
      setCustomModalInitialConfig(undefined)
      setAiPromptData(undefined)
      setShowCustomModal(true)
    } else if (selectedOption === "ai-builder") {
      setShowAiBuilderModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-black">{t.title}</h1>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>

        {/* Start Practice Button */}
        <div className="w-full">
          <Button
            onClick={handleStartPractice}
            disabled={!selectedOption}
            className="w-full bg-black hover:bg-gray-800 text-white py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.startPractice}
          </Button>
        </div>

        {/* Practice Style Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black text-center">{t.choosePracticeStyle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Quick Call Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "quick"
                  ? "ring-1 ring-black bg-gray-50 border-black"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setSelectedOption("quick")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                  {selectedOption === "quick" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black mb-1">{t.quickCall}</h3>
                  <p className="text-xs text-gray-600">{t.quickCallDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Lesson Builder Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "ai-builder"
                  ? "ring-1 ring-black bg-gray-50 border-black"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setSelectedOption("ai-builder")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  {selectedOption === "ai-builder" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black mb-1">{t.aiLessonBuilder}</h3>
                  <p className="text-xs text-gray-600">{t.aiLessonBuilderDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "advanced"
                  ? "ring-1 ring-black bg-gray-50 border-black"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setSelectedOption("advanced")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Settings className="w-5 h-5 text-black" />
                  </div>
                  {selectedOption === "advanced" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black mb-1">{t.advanced}</h3>
                  <p className="text-xs text-gray-600">{t.advancedDescription}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {!selectedOption && <p className="text-center text-gray-500 text-xs">{t.selectOption}</p>}
        </div>
      </div>

      {/* Custom Call Modal */}
      <CustomCallModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false)
          setCustomModalInitialConfig(undefined)
          setAiPromptData(undefined)
        }}
        onStartCall={handleCustomCall}
        onBackToAiBuilder={aiPromptData ? handleBackToAiBuilder : undefined}
        language={language}
        initialConfig={customModalInitialConfig}
      />

      {/* AI Lesson Builder Modal */}
      <AiLessonBuilderModal
        isOpen={showAiBuilderModal}
        onClose={() => setShowAiBuilderModal(false)}
        onOpenCustomModal={handleOpenCustomModalWithConfig}
        language={language}
        initialData={aiPromptData}
      />
    </div>
  )
}
