"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, Lightbulb } from "lucide-react"
import type { CustomCallConfig } from "./custom-call-modal"

interface AiLessonBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenCustomModal: (
    config: CustomCallConfig,
    promptData?: {
      rawTopic: string
      conversationMode: string
      voice: string
      timeLimit: string
    },
  ) => void
  language: "en" | "vi"
  initialData?: {
    rawTopic: string
    conversationMode: string
    voice: string
    timeLimit: string
  }
}

const translations = {
  en: {
    aiLessonBuilder: "AI Lesson Builder",
    whatToLearn: "What would you like to learn or practice?",
    topicPlaceholder: "Describe what you want to practice...",
    exampleTopics: "Example topics:",
    conversationMode: "Conversation Mode",
    voiceSettings: "Voice Settings",
    timeSettings: "Time Settings (minutes)",
    generateLesson: "Generate Lesson",
    generating: "Generating...",
    generatingSteps: [
      "Analyzing your topic...",
      "Creating learning objectives...",
      "Designing conversation flow...",
      "Finalizing lesson structure...",
    ],
    conversationModes: {
      practice: "Language Practice",
      interview: "Job Interview",
      chat: "Casual Chat",
    },
    voiceOptions: {
      alloy: "Alloy",
      echo: "Echo",
      fable: "Fable",
      onyx: "Onyx",
      nova: "Nova",
      shimmer: "Shimmer",
    },
    timeOptions: {
      "1": "1 minute",
      "2": "2 minutes",
      "3": "3 minutes",
      "5": "5 minutes",
      "8": "8 minutes",
    },
    examples: {
      practice: [
        "Ordering food at a restaurant",
        "Asking for directions in a new city",
        "Making small talk with colleagues",
        "Discussing weekend plans with friends",
      ],
      interview: [
        "Software engineer job interview",
        "Marketing manager position interview",
        "Customer service representative interview",
        "Teaching position interview",
      ],
      chat: [
        "Talking about hobbies and interests",
        "Discussing travel experiences",
        "Sharing opinions about movies",
        "Chatting about daily routines",
      ],
    },
    error: "Failed to generate lesson. Please try again.",
  },
  vi: {
    aiLessonBuilder: "Trình Tạo Bài Học AI",
    whatToLearn: "Bạn muốn học hoặc luyện tập gì?",
    topicPlaceholder: "Mô tả những gì bạn muốn luyện tập...",
    exampleTopics: "Chủ đề ví dụ:",
    conversationMode: "Chế Độ Hội Thoại",
    voiceSettings: "Cài Đặt Giọng Nói",
    timeSettings: "Cài Đặt Thời Gian (phút)",
    generateLesson: "Tạo Bài Học",
    generating: "Đang tạo...",
    generatingSteps: [
      "Đang phân tích chủ đề của bạn...",
      "Đang tạo mục tiêu học tập...",
      "Đang thiết kế luồng hội thoại...",
      "Đang hoàn thiện cấu trúc bài học...",
    ],
    conversationModes: {
      practice: "Luyện Tập Ngôn Ngữ",
      interview: "Phỏng Vấn Công Việc",
      chat: "Trò Chuyện Thường Ngày",
    },
    voiceOptions: {
      alloy: "Alloy",
      echo: "Echo",
      fable: "Fable",
      onyx: "Onyx",
      nova: "Nova",
      shimmer: "Shimmer",
    },
    timeOptions: {
      "1": "1 phút",
      "2": "2 phút",
      "3": "3 phút",
      "5": "5 phút",
      "8": "8 phút",
    },
    examples: {
      practice: [
        "Đặt món ăn tại nhà hàng",
        "Hỏi đường trong thành phố mới",
        "Trò chuyện phiếm với đồng nghiệp",
        "Thảo luận kế hoạch cuối tuần với bạn bè",
      ],
      interview: [
        "Phỏng vấn kỹ sư phần mềm",
        "Phỏng vấn vị trí quản lý marketing",
        "Phỏng vấn đại diện chăm sóc khách hàng",
        "Phỏng vấn vị trí giảng dạy",
      ],
      chat: [
        "Nói về sở thích và mối quan tâm",
        "Thảo luận trải nghiệm du lịch",
        "Chia sẻ ý kiến về phim ảnh",
        "Trò chuyện về thói quen hàng ngày",
      ],
    },
    error: "Không thể tạo bài học. Vui lòng thử lại.",
  },
}

export function AiLessonBuilderModal({
  isOpen,
  onClose,
  onOpenCustomModal,
  language,
  initialData,
}: AiLessonBuilderModalProps) {
  const [rawTopic, setRawTopic] = useState(initialData?.rawTopic || "")
  const [conversationMode, setConversationMode] = useState(initialData?.conversationMode || "practice")
  const [voice, setVoice] = useState(initialData?.voice || "alloy")
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || "5")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")

  const t = translations[language]

  const handleExampleClick = (example: string) => {
    setRawTopic(example)
  }

  const handleGenerate = async () => {
    if (!rawTopic.trim()) return

    setIsGenerating(true)
    setError("")
    setCurrentStep(0)

    // Simulate loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < t.generatingSteps.length - 1) {
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 800)

    try {
      const response = await fetch("/api/generate-lesson-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawTopic,
          conversationMode,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate lesson")
      }

      const data = await response.json()

      // Clear the interval and wait a bit before proceeding
      clearInterval(stepInterval)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const config: CustomCallConfig = {
        topic: data.topic || rawTopic,
        goal: data.goal || "",
        rules: data.rules || "",
        expectations: data.expectations || "",
        timeLimit,
        voice,
        conversationMode,
      }

      const promptData = {
        rawTopic,
        conversationMode,
        voice,
        timeLimit,
      }

      onOpenCustomModal(config, promptData)
      onClose()
    } catch (err) {
      clearInterval(stepInterval)
      setError(t.error)
    } finally {
      setIsGenerating(false)
      setCurrentStep(0)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setRawTopic(initialData?.rawTopic || "")
      setConversationMode(initialData?.conversationMode || "practice")
      setVoice(initialData?.voice || "alloy")
      setTimeLimit(initialData?.timeLimit || "5")
      setError("")
      onClose()
    }
  }

  const currentExamples = t.examples[conversationMode as keyof typeof t.examples] || []

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white border border-gray-300 shadow-lg rounded-lg p-0">
        <DialogHeader className="p-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-black">{t.aiLessonBuilder}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-5 w-5 p-0" disabled={isGenerating}>
              <X className="w-3 h-3 text-gray-500" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Topic Input */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.whatToLearn}</Label>
            <Textarea
              value={rawTopic}
              onChange={(e) => setRawTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="border-gray-300 focus:border-black focus:ring-black min-h-[80px] resize-none text-sm"
              disabled={isGenerating}
            />
          </div>

          {/* Example Topics */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Lightbulb className="w-4 h-4 text-gray-500" />
              <Label className="text-xs font-medium text-gray-600">{t.exampleTopics}</Label>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {currentExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="text-left text-xs text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.conversationMode}</Label>
              <Select value={conversationMode} onValueChange={setConversationMode} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-black focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice" className="text-xs py-1">
                    {t.conversationModes.practice}
                  </SelectItem>
                  <SelectItem value="interview" className="text-xs py-1">
                    {t.conversationModes.interview}
                  </SelectItem>
                  <SelectItem value="chat" className="text-xs py-1">
                    {t.conversationModes.chat}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.voiceSettings}</Label>
              <Select value={voice} onValueChange={setVoice} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-black focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.voiceOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.timeSettings}</Label>
              <Select value={timeLimit} onValueChange={setTimeLimit} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-black focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.timeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.generating}</span>
              </div>
              <div className="space-y-2">
                {t.generatingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`text-xs flex items-center gap-2 ${
                      index <= currentStep ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index < currentStep
                          ? "bg-green-500"
                          : index === currentStep
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-300"
                      }`}
                    />
                    {step}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-black h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / t.generatingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end border-t">
          <Button
            onClick={handleGenerate}
            disabled={!rawTopic.trim() || isGenerating}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm h-8 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {t.generating}
              </>
            ) : (
              t.generateLesson
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
