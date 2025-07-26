"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneCall, MessageCircle, Briefcase, Utensils, Plane, Users, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickChatModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (config: {
    topic: string
    conversationMode: string
    voice: string
    timeLimit: string
  }) => void
  language?: "en" | "vi"
}

const translations = {
  en: {
    title: "Quick Chat Setup",
    selectTopic: "Select a topic to get started",
    voiceSettings: "Voice Settings",
    timeSettings: "Time Settings (minutes)",
    conversationMode: "Conversation Mode",
    startChat: "Start Chat",
    commonTopics: {
      "general-conversation": "General Conversation",
      "work-career": "Work & Career",
      "food-cooking": "Food & Cooking",
      "travel-culture": "Travel & Culture",
      "daily-life": "Daily Life",
      "hobbies-interests": "Hobbies & Interests",
    },
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
  },
  vi: {
    title: "Thiết Lập Trò Chuyện Nhanh",
    selectTopic: "Chọn chủ đề để bắt đầu",
    voiceSettings: "Cài Đặt Giọng Nói",
    timeSettings: "Cài Đặt Thời Gian (phút)",
    conversationMode: "Chế Độ Hội Thoại",
    startChat: "Bắt Đầu Trò Chuyện",
    commonTopics: {
      "general-conversation": "Hội Thoại Tổng Quát",
      "work-career": "Công Việc & Sự Nghiệp",
      "food-cooking": "Ẩm Thực & Nấu Ăn",
      "travel-culture": "Du Lịch & Văn Hóa",
      "daily-life": "Cuộc Sống Hàng Ngày",
      "hobbies-interests": "Sở Thích & Quan Tâm",
    },
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
  },
}

const topicIcons = {
  "general-conversation": MessageCircle,
  "work-career": Briefcase,
  "food-cooking": Utensils,
  "travel-culture": Plane,
  "daily-life": Users,
  "hobbies-interests": Heart,
}

export function QuickChatModal({ isOpen, onClose, onStartChat, language = "en" }: QuickChatModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("general-conversation")
  const [conversationMode, setConversationMode] = useState<string>("chat") // Default to "chat" (Casual Chat)
  const [timeLimit, setTimeLimit] = useState<string>("5")
  const [voice, setVoice] = useState<string>("alloy")

  const t = translations[language]

  const handleStartChat = () => {
    if (selectedTopic) {
      onStartChat({
        topic: t.commonTopics[selectedTopic as keyof typeof t.commonTopics],
        conversationMode,
        voice,
        timeLimit,
      })
      onClose()
    }
  }

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border border-gray-300 shadow-lg rounded-lg p-0 font-['Inter']">
        <DialogHeader className="p-4 pb-3 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-black font-['Inter']">{t.title}</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4 py-0 px-4 font-['Inter']">
          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-black mb-2 block font-['Inter']">{t.selectTopic}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(t.commonTopics).map(([key, label]) => {
                const IconComponent = topicIcons[key as keyof typeof topicIcons]
                return (
                  <Card
                    key={key}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md group",
                      selectedTopic === key
                        ? "ring-2 ring-purple-600 bg-purple-50 border-purple-600"
                        : "border-gray-300 hover:border-purple-600 hover:bg-purple-50 bg-white",
                    )}
                    onClick={() => handleTopicSelect(key)}
                  >
                    <CardContent className="p-3 text-center space-y-1">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors duration-200",
                          selectedTopic === key ? "bg-purple-600" : "bg-gray-100 group-hover:bg-purple-600",
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-4 h-4 transition-colors duration-200",
                            selectedTopic === key ? "text-white" : "text-gray-600 group-hover:text-white",
                          )}
                        />
                      </div>
                      <p
                        className={cn(
                          "text-xs font-medium transition-colors duration-200 font-['Inter']",
                          selectedTopic === key ? "text-purple-700" : "text-gray-700 group-hover:text-purple-700",
                        )}
                      >
                        {label}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Settings Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversation Mode - Disabled and set to Casual Chat */}
            <div>
              <label className="text-xs font-medium mb-1 block font-['Inter'] text-slate-300">
                {t.conversationMode}
              </label>
              <Select value={conversationMode} onValueChange={setConversationMode} disabled>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white text-black font-['Inter']">
                  <SelectValue>{t.conversationModes[conversationMode as keyof typeof t.conversationModes]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 font-['Inter']">
                  <SelectItem value="practice" className="text-xs py-1 text-black font-['Inter']">
                    {t.conversationModes.practice}
                  </SelectItem>
                  <SelectItem value="interview" className="text-xs py-1 text-black font-['Inter']">
                    {t.conversationModes.interview}
                  </SelectItem>
                  <SelectItem value="chat" className="text-xs py-1 text-black font-['Inter']">
                    {t.conversationModes.chat}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Settings */}
            <div>
              <label className="text-xs font-medium text-black mb-1 block font-['Inter']">{t.voiceSettings}</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white text-black font-['Inter']">
                  <SelectValue>{t.voiceOptions[voice as keyof typeof t.voiceOptions]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 font-['Inter']">
                  {Object.entries(t.voiceOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1 text-black font-['Inter']">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Settings */}
            <div>
              <label className="text-xs font-medium text-black mb-1 block font-['Inter']">{t.timeSettings}</label>
              <Select value={timeLimit} onValueChange={setTimeLimit}>
                <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-purple-500 focus:ring-0 bg-white text-black font-['Inter']">
                  <SelectValue>{t.timeOptions[timeLimit as keyof typeof t.timeOptions]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 font-['Inter']">
                  {Object.entries(t.timeOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs py-1 text-black font-['Inter']">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex justify-center pb-4 pr-4 pl-4 pt-0">
            <Button
              onClick={handleStartChat}
              disabled={!selectedTopic}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-1 rounded-md font-medium text-xs h-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneCall className="w-4 h-4 pr-1" />
              {t.startChat}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
