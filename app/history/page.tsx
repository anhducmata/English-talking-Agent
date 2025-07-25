"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Trash2, Eye, Calendar, Clock, MessageSquare } from "lucide-react"
import { ConversationHistoryModal } from "@/components/conversation-history-modal"
import { deleteConversation, clearAllConversations, type ConversationEntry } from "@/lib/conversation-storage"
import { cn } from "@/lib/utils"
import { HistoryPageSkeleton } from "@/components/page-skeleton"
import { useConversationCache } from "@/hooks/use-conversation-cache"

const translations = {
  en: {
    title: "Conversation History",
    totalSessions: "Total Sessions",
    totalTime: "Total Time",
    avgDuration: "Avg Duration",
    minutes: "min",
    noConversations: "No conversations yet",
    startPracticing: "Start practicing to see your conversation history here.",
    resume: "Resume",
    delete: "Delete",
    view: "View",
    clearAll: "Clear All",
    confirmClear: "Are you sure you want to clear all conversation history?",
    conversationDeleted: "Conversation deleted",
    allConversationsCleared: "All conversations cleared",
    modes: {
      "casual-chat": "Casual Chat",
      "speaking-practice": "Speaking Practice",
      interview: "Interview",
    },
  },
  vi: {
    title: "Lịch Sử Hội Thoại",
    totalSessions: "Tổng Phiên",
    totalTime: "Tổng Thời Gian",
    avgDuration: "Thời Lượng TB",
    minutes: "phút",
    noConversations: "Chưa có cuộc hội thoại nào",
    startPracticing: "Bắt đầu luyện tập để xem lịch sử hội thoại của bạn tại đây.",
    resume: "Tiếp Tục",
    delete: "Xóa",
    view: "Xem",
    clearAll: "Xóa Tất Cả",
    confirmClear: "Bạn có chắc chắn muốn xóa tất cả lịch sử hội thoại không?",
    conversationDeleted: "Đã xóa cuộc hội thoại",
    allConversationsCleared: "Đã xóa tất cả cuộc hội thoại",
    modes: {
      "casual-chat": "Trò Chuyện Thường",
      "speaking-practice": "Luyện Nói",
      interview: "Phỏng Vấn",
    },
  },
}

export default function HistoryPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [selectedConversation, setSelectedConversation] = useState<ConversationEntry | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [translationsData, setTranslations] = useState<Record<string, string>>({})
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({})

  // Use the conversation cache hook
  const { conversations, loading, updateConversationCache } = useConversationCache()

  const t = translations[language]

  if (loading) {
    return <HistoryPageSkeleton />
  }

  const handleResumeConversation = (conversation: ConversationEntry) => {
    const searchParams = new URLSearchParams({
      conversationId: conversation.id,
      topic: conversation.config.topic,
      timeLimit: conversation.config.timeLimit.toString(),
      voice: conversation.config.voice,
      difficulty: conversation.config.difficulty.toString(),
      language: conversation.config.language,
      mode: conversation.config.mode,
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm(t.confirmClear)) {
      deleteConversation(conversationId)
      const updatedConversations = conversations.filter((conv) => conv.id !== conversationId)
      updateConversationCache(updatedConversations)
    }
  }

  const handleViewConversation = (conversation: ConversationEntry) => {
    setSelectedConversation(conversation)
    setShowHistoryModal(true)
  }

  const handleClearAll = () => {
    if (confirm(t.confirmClear)) {
      clearAllConversations()
      updateConversationCache([])
    }
  }

  const translateMessage = async (messageId: string, text: string) => {
    if (translationsData[messageId]) {
      setTranslations((prev) => ({
        ...prev,
        [messageId]: prev[messageId] === text ? "" : prev[messageId],
      }))
      return
    }

    setLoadingTranslations((prev) => ({ ...prev, [messageId]: true }))

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          targetLanguage: "vi",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTranslations((prev) => ({
          ...prev,
          [messageId]: result.translation,
        }))
      }
    } catch (error) {
      console.error("Translation error:", error)
    } finally {
      setLoadingTranslations((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  // Calculate statistics
  const totalSessions = conversations.length
  const totalTime = conversations.reduce((sum, conv) => sum + (conv.duration || 0), 0)
  const avgDuration = totalSessions > 0 ? totalTime / totalSessions : 0

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "casual-chat":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "speaking-practice":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "interview":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden">
      {/* Animated Flying Character Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -left-1 -right-1 top-3 h-0.5 bg-white rounded-full animate-pulse delay-100"></div>
          </div>
        </div>

        <div className="absolute animate-[fly2_25s_linear_infinite] opacity-10">
          <div className="w-6 h-6 bg-gray-400 rounded-full relative">
            <div className="absolute -left-1.5 -right-1.5 top-1 h-0.5 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            <div className="absolute -left-1 -right-1 top-2.5 h-0.5 bg-gray-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        <div className="absolute animate-[fly3_30s_linear_infinite] opacity-10">
          <div className="w-10 h-10 bg-white rounded-full relative">
            <div className="absolute -left-3 -right-3 top-2 h-1 bg-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute -left-2 -right-2 top-4 h-0.5 bg-white rounded-full animate-pulse delay-600"></div>
          </div>
        </div>

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

      <div className="container mx-auto px-6 py-6 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {conversations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black bg-transparent"
              >
                {t.clearAll}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => setLanguage("en")}
                className={cn(
                  "text-xs bg-transparent hover:bg-transparent",
                  language === "en" ? "text-white" : "text-gray-400 hover:text-white",
                )}
              >
                EN
              </Button>
              <Button
                size="sm"
                onClick={() => setLanguage("vi")}
                className={cn(
                  "text-xs bg-transparent hover:bg-transparent",
                  language === "vi" ? "text-white" : "text-gray-400 hover:text-white",
                )}
              >
                VI
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {conversations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{totalSessions}</div>
                <div className="text-sm text-gray-400">{t.totalSessions}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{Math.round(totalTime)}</div>
                <div className="text-sm text-gray-400">
                  {t.totalTime} ({t.minutes})
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{Math.round(avgDuration)}</div>
                <div className="text-sm text-gray-400">
                  {t.avgDuration} ({t.minutes})
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">{t.noConversations}</h3>
            <p className="text-gray-500 mb-6">{t.startPracticing}</p>
            <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-gray-200">
              Start Practicing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{conversation.config.topic}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(conversation.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {Math.round(conversation.duration)} {t.minutes}
                          </span>
                        </div>
                        <Badge className={getModeColor(conversation.config.mode)}>
                          {t.modes[conversation.config.mode as keyof typeof t.modes]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResumeConversation(conversation)}
                        className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {t.resume}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewConversation(conversation)}
                        className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t.view}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteConversation(conversation.id)}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p className="line-clamp-2">
                      {conversation.messages.length > 0
                        ? conversation.messages[conversation.messages.length - 1].content
                        : "No messages"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conversation History Modal */}
      <ConversationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        conversation={
          selectedConversation?.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            audioUrl: msg.audioData ? undefined : undefined, // Audio URLs are not preserved in storage
          })) || []
        }
        language={language}
        translateMessage={translateMessage}
        translationsData={translationsData}
        loadingTranslations={loadingTranslations}
      />

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
