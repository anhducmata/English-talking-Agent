"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Trash2, Eye, Clock, Star } from "lucide-react"
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
    showNext: "Show Next",
    modes: {
      "casual-chat": "Casual Chat",
      "speaking-practice": "Speaking Practice",
      interview: "Interview",
    },
    priority: {
      high: "High",
      medium: "Medium",
      low: "Low",
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
    showNext: "Hiển Thị Tiếp",
    modes: {
      "casual-chat": "Trò Chuyện Thường",
      "speaking-practice": "Luyện Nói",
      interview: "Phỏng Vấn",
    },
    priority: {
      high: "Cao",
      medium: "Trung Bình",
      low: "Thấp",
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
  const [visibleCount, setVisibleCount] = useState(6)

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

  const formatDate = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getPriority = (conversation: ConversationEntry) => {
    const duration = conversation.duration || 0
    if (duration > 10) return "high"
    if (duration > 5) return "medium"
    return "low"
  }

  const visibleConversations = conversations.slice(0, visibleCount)
  const hasMore = conversations.length > visibleCount

  // Group conversations by time periods
  const groupConversationsByTime = (conversations: ConversationEntry[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const groups = {
      today: [] as ConversationEntry[],
      yesterday: [] as ConversationEntry[],
      lastWeek: [] as ConversationEntry[],
      thisMonth: [] as ConversationEntry[],
      longTimeAgo: [] as ConversationEntry[],
    }

    conversations.forEach((conversation) => {
      const conversationDate = new Date(conversation.timestamp)
      const conversationDay = new Date(
        conversationDate.getFullYear(),
        conversationDate.getMonth(),
        conversationDate.getDate(),
      )

      if (conversationDay.getTime() === today.getTime()) {
        groups.today.push(conversation)
      } else if (conversationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conversation)
      } else if (conversationDate >= lastWeek) {
        groups.lastWeek.push(conversation)
      } else if (conversationDate >= thisMonth) {
        groups.thisMonth.push(conversation)
      } else {
        groups.longTimeAgo.push(conversation)
      }
    })

    return groups
  }

  const groupedConversations = groupConversationsByTime(conversations)
  const groupLabels = {
    today: "Today",
    yesterday: "Yesterday",
    lastWeek: "Last 7 days",
    thisMonth: "This month",
    longTimeAgo: "Long time ago",
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

      <div className="relative z-10">
        <div className="p-2 md:p-8 flex justify-center items-center">
          <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="text-zinc-400 hover:text-white hover:bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-semibold text-white">{t.title}</h1>
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
                      language === "en" ? "text-white" : "text-zinc-400 hover:text-white",
                    )}
                  >
                    EN
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLanguage("vi")}
                    className={cn(
                      "text-xs bg-transparent hover:bg-transparent",
                      language === "vi" ? "text-white" : "text-zinc-400 hover:text-white",
                    )}
                  >
                    VI
                  </Button>
                </div>
              </div>
            </div>

            {/* Conversation List */}
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-xl font-semibold text-zinc-400 mb-2">{t.noConversations}</div>
                <p className="text-zinc-500 mb-6">{t.startPracticing}</p>
                <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-zinc-200">
                  Start Practicing
                </Button>
              </div>
            ) : (
              <>
                {Object.entries(groupedConversations).map(([groupKey, groupConversations]) => {
                  if (groupConversations.length === 0) return null

                  return (
                    <div key={groupKey} className="space-y-4">
                      <h2 className="text-lg font-semibold text-zinc-300 px-2">
                        {groupLabels[groupKey as keyof typeof groupLabels]}
                      </h2>

                      {groupConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="group p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors duration-200 hover:border-fuchsia-500/30 dark:hover:border-fuchsia-500/30 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1">
                              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {conversation.config.topic}
                              </h3>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {t.modes[conversation.config.mode as keyof typeof t.modes]} •{" "}
                                {conversation.messages.length} messages
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResumeConversation(conversation)}
                                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black bg-transparent"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {t.resume}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewConversation(conversation)}
                                className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {t.view}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConversation(conversation.id)}
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black bg-transparent"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(conversation.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{t.priority[getPriority(conversation) as keyof typeof t.priority]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
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
            audioUrl: msg.audioData ? undefined : undefined,
          })) || []
        }
        language={language}
        translateMessage={translateMessage}
        translationsData={translationsData}
        loadingTranslations={loadingTranslations}
      />
    </div>
  )
}
