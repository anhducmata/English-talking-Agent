"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2 } from "lucide-react"
import type { CustomCallConfig } from "./custom-call-modal"

interface AiLessonBuilderModalProps {
  // Renamed interface
  isOpen: boolean
  onClose: () => void
  onOpenCustomModal: (
    config: CustomCallConfig,
    promptData?: { rawTopic: string; conversationMode: string; voice: string; timeLimit: string },
  ) => void
  language: "en" | "vi"
  initialData?: { rawTopic: string; conversationMode: string; voice: string; timeLimit: string }
}

const translations = {
  en: {
    createLesson: "AI Custom Call",
    topicPrompt: "What would you like to practice?",
    topicPlaceholder:
      "e.g., Job interview for software engineer, Ordering food at a restaurant, Discussing climate change...",
    conversationMode: "Conversation Mode",
    voiceSettings: "Voice Settings",
    timeSettings: "Time Settings (minutes)",
    voiceOptions: {
      alloy: "Alloy",
      echo: "Echo",
      fable: "Fable",
      onyx: "Onyx",
      nova: "Nova",
      shimmer: "Shimmer",
    },
    conversationModes: {
      practice: "Language Practice",
      interview: "Job Interview",
      chat: "Casual Chat",
    },
    timeOptions: {
      "1": "1 minute",
      "2": "2 minutes",
      "3": "3 minutes",
      "5": "5 minutes",
      "8": "8 minutes",
    },
    generateLesson: "Generate Lesson",
    generating: "Generating...",
    generationError: "Failed to generate content. Please try again.",
  },
  vi: {
    createLesson: "Cuộc Gọi AI Tùy Chỉnh",
    topicPrompt: "Bạn muốn luyện tập gì?",
    topicPlaceholder: "ví dụ: Phỏng vấn xin việc kỹ sư phần mềm, Gọi món ở nhà hàng, Thảo luận về biến đổi khí hậu...",
    conversationMode: "Chế Độ Hội Thoại",
    voiceSettings: "Cài Đặt Giọng Nói",
    timeSettings: "Cài Đặt Thời Gian (phút)",
    voiceOptions: {
      alloy: "Alloy",
      echo: "Echo",
      fable: "Fable",
      onyx: "Onyx",
      nova: "Nova",
      shimmer: "Shimmer",
    },
    conversationModes: {
      practice: "Luyện Tập Ngôn Ngữ",
      interview: "Phỏng Vấn Công Việc",
      chat: "Trò Chuyện Thường Ngày",
    },
    timeOptions: {
      "1": "1 phút",
      "2": "2 phút",
      "3": "3 phút",
      "5": "5 phút",
      "8": "8 phút",
    },
    generateLesson: "Tạo Bài Học",
    generating: "Đang tạo...",
    generationError: "Không thể tạo nội dung. Vui lòng thử lại.",
  },
}

export function AiLessonBuilderModal({
  isOpen,
  onClose,
  onOpenCustomModal,
  language,
  initialData,
}: AiLessonBuilderModalProps) {
  // Renamed function
  const [rawTopic, setRawTopic] = useState(initialData?.rawTopic || "")
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || "5")
  const [voice, setVoice] = useState(initialData?.voice || "alloy")
  const [conversationMode, setConversationMode] = useState(initialData?.conversationMode || "practice")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language]

  const generateAndOpenCustomModal = async () => {
    if (!rawTopic.trim()) return

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/generate-lesson-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawTopic: rawTopic.trim(),
          conversationMode,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const generatedContent = await response.json()

      // Create config with generated content
      const config: CustomCallConfig = {
        topic: generatedContent.topic,
        goal: generatedContent.goal,
        rules: generatedContent.rules,
        expectations: generatedContent.expectations,
        timeLimit: Number.parseInt(timeLimit),
        voice,
        conversationMode: conversationMode as "casual-chat" | "speaking-practice" | "interview",
      }

      // Close this modal and open custom modal with generated data
      handleClose()
      onOpenCustomModal(config, { rawTopic, conversationMode, voice, timeLimit })
    } catch (error) {
      console.error("Error generating content:", error)
      setError(t.generationError)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setRawTopic(initialData?.rawTopic || "")
    setTimeLimit(initialData?.timeLimit || "5")
    setVoice(initialData?.voice || "alloy")
    setConversationMode(initialData?.conversationMode || "practice")
    setIsGenerating(false)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white border border-gray-300 shadow-lg rounded-lg p-0">
        <DialogHeader className="p-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <DialogTitle className="text-lg font-semibold text-black">{t.createLesson}</DialogTitle>
            </div>
            {/* Removed the X button as per previous request */}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Topic Input */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.topicPrompt}</Label>
            <Textarea
              value={rawTopic}
              onChange={(e) => setRawTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[80px] resize-none text-xs"
              disabled={isGenerating}
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Conversation Mode */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.conversationMode}</Label>
              <Select value={conversationMode} onValueChange={setConversationMode} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0">
                  <SelectValue>{t.conversationModes[conversationMode as keyof typeof t.conversationModes]}</SelectValue>
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

            {/* Voice Settings */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.voiceSettings}</Label>
              <Select value={voice} onValueChange={setVoice} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0">
                  <SelectValue>{t.voiceOptions[voice as keyof typeof t.voiceOptions]}</SelectValue>
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

            {/* Time Settings */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.timeSettings}</Label>
              <Select value={timeLimit} onValueChange={setTimeLimit} disabled={isGenerating}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0">
                  <SelectValue>{t.timeOptions[timeLimit as keyof typeof t.timeOptions]}</SelectValue>
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

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end pb-4 pr-4 pl-4 pt-0">
          <Button
            onClick={generateAndOpenCustomModal}
            disabled={!rawTopic.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-md font-medium text-sm h-9 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t.generateLesson}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
