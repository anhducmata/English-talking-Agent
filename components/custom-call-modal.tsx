"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ArrowLeft, PhoneCall } from "lucide-react"
import Link from "next/link"

interface CustomCallModalProps {
  isOpen: boolean
  onClose: () => void
  onStartCall: (config: CustomCallConfig) => void
  onBackToAiBuilder?: () => void
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
}

const translations = {
  en: {
    callSettings: "Call Settings",
    aiGeneratedLesson: "AI Generated Lesson",
    lessonTopic: "Lesson Topic",
    topicPlaceholder: "e.g., Job interview preparation, Restaurant conversation, Travel planning...",
    goal: "Goal: What should I learn?",
    goalPlaceholder:
      "e.g., I will learn how to introduce myself professionally and answer common interview questions with confidence.",
    rules: "Rules: How will you guide students?",
    rulesPlaceholder:
      "e.g., You will ask follow-up questions, provide gentle corrections, and encourage me to elaborate on my answers.",
    expectations: "Expect: What should I accomplish?",
    expectationsPlaceholder:
      "e.g., By the end, I should feel comfortable discussing my background and asking relevant questions.",
    voiceSettings: "Voice Settings",
    timeSettings: "Time Settings (minutes)",
    conversationMode: "Conversation Mode",
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
      "10": "10 minutes",
    },
    saveLesson: "Start Call",
    backToBuilder: "Back to AI Builder",
  },
  vi: {
    callSettings: "Cài Đặt Cuộc Gọi",
    aiGeneratedLesson: "Bài Học Được Tạo Bởi AI",
    lessonTopic: "Chủ Đề Bài Học",
    topicPlaceholder: "ví dụ: Chuẩn bị phỏng vấn, Hội thoại nhà hàng, Lập kế hoạch du lịch...",
    goal: "Mục tiêu: Tôi nên học gì?",
    goalPlaceholder:
      "ví dụ: Tôi sẽ học cách giới thiệu bản thân một cách chuyên nghiệp và trả lời các câu hỏi phỏng vấn thông thường một cách tự tin.",
    rules: "Quy tắc: Bạn sẽ hướng dẫn như thế nào?",
    rulesPlaceholder:
      "ví dụ: Bạn sẽ đặt câu hỏi tiếp theo, đưa ra những sửa chữa nhẹ nhàng và khuyến khích tôi mở rộng câu trả lời.",
    expectations: "Kỳ vọng: Tôi nên đạt được gì?",
    expectationsPlaceholder:
      "ví dụ: Cuối buổi học, tôi nên cảm thấy thoải mái khi thảo luận về bản thân và đặt câu hỏi liên quan.",
    voiceSettings: "Cài Đặt Giọng Nói",
    timeSettings: "Cài Đặt Thời Gian (phút)",
    conversationMode: "Chế Độ Hội Thoại",
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
      "10": "10 phút",
    },
    saveLesson: "Bắt đầu cuộc gọi",
    backToBuilder: "Quay lại AI Builder",
  },
}

const defaultConfig: CustomCallConfig = {
  topic: "",
  goal: "",
  rules: "",
  expectations: "",
  timeLimit: "5",
  voice: "alloy",
  conversationMode: "practice",
}

export function CustomCallModal({
  isOpen,
  onClose,
  onStartCall,
  onBackToAiBuilder,
  language,
  initialConfig,
}: CustomCallModalProps) {
  const [config, setConfig] = useState<CustomCallConfig>(defaultConfig)

  const t = translations[language]
  const isAiGenerated = !!onBackToAiBuilder

  // Update config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    } else {
      setConfig(defaultConfig)
    }
  }, [initialConfig, isOpen])

  const handleStartCall = () => {
    if (config.topic.trim()) {
      onStartCall(config)
      onClose()
    }
  }

  const handleClose = () => {
    if (!initialConfig) {
      setConfig(defaultConfig)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white border border-gray-300 shadow-lg rounded-lg p-0 text-black">
        <DialogHeader className="p-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAiGenerated && onBackToAiBuilder && (
                <Link
                  href="/ai-prompt-settings"
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 px-2 py-1 rounded"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Return to prompt setting page
                </Link>
              )}
              <DialogTitle className="text-lg font-semibold text-black">
                {isAiGenerated ? t.aiGeneratedLesson : t.callSettings}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-5 w-5 p-0">
              <X className="w-3 h-3 text-gray-600" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 py-0">
          {/* Top Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.lessonTopic}</Label>
                <Textarea
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder={t.topicPlaceholder}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[50px] resize-none text-black bg-white"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.goal}</Label>
                <Textarea
                  value={config.goal}
                  onChange={(e) => setConfig({ ...config, goal: e.target.value })}
                  placeholder={t.goalPlaceholder}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[60px] resize-none text-black bg-white"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.rules}</Label>
                <Textarea
                  value={config.rules}
                  onChange={(e) => setConfig({ ...config, rules: e.target.value })}
                  placeholder={t.rulesPlaceholder}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[50px] resize-none text-black bg-white"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.expectations}</Label>
                <Textarea
                  value={config.expectations}
                  onChange={(e) => setConfig({ ...config, expectations: e.target.value })}
                  placeholder={t.expectationsPlaceholder}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[60px] resize-none text-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Bottom Section - Dropdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Conversation Mode */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.conversationMode}</Label>
              <Select
                value={config.conversationMode}
                onValueChange={(value) => setConfig({ ...config, conversationMode: value })}
              >
                <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white">
                  <SelectValue className="text-black">
                    {t.conversationModes[config.conversationMode as keyof typeof t.conversationModes]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="practice" className="text-xs py-1 text-black">
                    {t.conversationModes.practice}
                  </SelectItem>
                  <SelectItem value="interview" className="text-xs py-1 text-black">
                    {t.conversationModes.interview}
                  </SelectItem>
                  <SelectItem value="chat" className="text-xs py-1 text-black">
                    {t.conversationModes.chat}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Settings */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.voiceSettings}</Label>
              <Select value={config.voice} onValueChange={(value) => setConfig({ ...config, voice: value })}>
                <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white">
                  <SelectValue className="text-black">
                    {t.voiceOptions[config.voice as keyof typeof t.voiceOptions]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {Object.entries(t.voiceOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1 text-black">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Settings */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">{t.timeSettings}</Label>
              <Select value={config.timeLimit} onValueChange={(value) => setConfig({ ...config, timeLimit: value })}>
                <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white">
                  <SelectValue className="text-black">
                    {t.timeOptions[config.timeLimit as keyof typeof t.timeOptions]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {Object.entries(t.timeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1 text-black">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex pl-2 pt-0 justify-center pb-4 pr-4">
          <Button
            onClick={handleStartCall}
            disabled={!config.topic.trim()}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-1 rounded-md font-medium text-xs h-6"
          >
            <PhoneCall className="w-3 h-3 mr-1" />
            {t.saveLesson}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
