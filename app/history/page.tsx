"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Trash2, Clock, MessageCircle, Globe } from "lucide-react"
import {
  loadAllConversations,
  deleteConversation,
  getConversationStats,
  type SavedConversation,
} from "@/lib/conversation-storage"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HistoryPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<SavedConversation[]>([])
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [stats, setStats] = useState({ totalConversations: 0, totalMinutesPracticed: 0 })
  const [selectedConversation, setSelectedConversation] = useState<SavedConversation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const translations = {
    en: {
      title: "Conversation History",
      subtitle: "Resume your previous practice sessions",
      backToSetup: "Back to Setup",
      noConversations: "No conversations yet",
      noConversationsDesc: "Start your first practice session to see your history here.",
      startPracticing: "Start Practicing",
      resume: "Resume",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this conversation?",
      topic: "Topic",
      level: "Level",
      duration: "Duration",
      messages: "messages",
      date: "Date",
      stats: "Practice Stats",
      totalSessions: "Total Sessions",
      totalMinutes: "Minutes Practiced",
      difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Int", "Advanced"],
      minutes: "min",
      ago: "ago",
      today: "Today",
      yesterday: "Yesterday",
      daysAgo: "days ago",
      you: "You",
      ai: "AI Teacher",
      close: "Close",
    },
    vi: {
      title: "Lịch Sử Hội Thoại",
      subtitle: "Tiếp tục các buổi luyện tập trước đây",
      backToSetup: "Quay Lại Cài Đặt",
      noConversations: "Chưa có hội thoại nào",
      noConversationsDesc: "Bắt đầu buổi luyện tập đầu tiên để xem lịch sử tại đây.",
      startPracticing: "Bắt Đầu Luyện Tập",
      resume: "Tiếp Tục",
      delete: "Xóa",
      confirmDelete: "Bạn có chắc chắn muốn xóa hội thoại này?",
      topic: "Chủ Đề",
      level: "Cấp Độ",
      duration: "Thời Gian",
      messages: "tin nhắn",
      date: "Ngày",
      stats: "Thống Kê Luyện Tập",
      totalSessions: "Tổng Buổi",
      totalMinutes: "Phút Đã Luyện",
      difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
      minutes: "phút",
      ago: "trước",
      today: "Hôm nay",
      yesterday: "Hôm qua",
      daysAgo: "ngày trước",
      you: "Bạn",
      ai: "AI Giáo Viên",
      close: "Đóng",
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Load language preference
    const savedSettings = localStorage.getItem("englishPracticeSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setLanguage(settings.language || "en")
      } catch (error) {
        console.error("Error loading language preference:", error)
      }
    }

    // Load conversations and stats
    loadData()
  }, [])

  const loadData = () => {
    const loadedConversations = loadAllConversations()
    setConversations(loadedConversations)
    setStats(getConversationStats())
  }

  const handleResume = (conversation: SavedConversation) => {
    const params = new URLSearchParams({
      topic: conversation.topic,
      timeLimit: getTimeLimitIndex(conversation.timeLimit).toString(),
      difficulty: conversation.difficulty.toString(),
      voice: conversation.voice,
      language: conversation.language,
      conversationId: conversation.id,
    })

    router.push(`/practice?${params.toString()}`)
  }

  const handleDelete = (conversationId: string) => {
    if (window.confirm(t.confirmDelete)) {
      deleteConversation(conversationId)
      loadData() // Reload data after deletion
    }
  }

  const getTimeLimitIndex = (actualMinutes: number): number => {
    const timeMap = { 1: 1, 2: 2, 3: 3, 5: 4, 8: 5, 10: 6 }
    return timeMap[actualMinutes as keyof typeof timeMap] || 1
  }

  const extractTopicTitle = (fullTopic: string) => {
    if (fullTopic.includes("# ") && fullTopic.includes(" - Speaking Practice")) {
      const titleLine = fullTopic.split("\n")[0]
      return titleLine.replace("# ", "").replace(" - Speaking Practice", "")
    }
    return fullTopic.length > 60 ? fullTopic.substring(0, 60) + "..." : fullTopic
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return t.today
    } else if (diffDays === 1) {
      return t.yesterday
    } else if (diffDays < 7) {
      return `${diffDays} ${t.daysAgo}`
    } else {
      return date.toLocaleDateString(language === "en" ? "en-US" : "vi-VN")
    }
  }

  const fmtDate = (ts: number) => new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

  const handleConversationClick = (conversation: SavedConversation) => {
    setSelectedConversation(conversation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConversation(null)
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
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-300 hover:text-white font-bold text-xs tracking-wide"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToSetup}
              </Button>
            </Link>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">{t.title}</h1>
              <p className="text-sm text-gray-400 font-medium">{t.subtitle}</p>
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

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-6xl">
        {/* Stats Cards */}
        {conversations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalConversations}</div>
                    <div className="text-xs text-gray-400 font-medium">{t.totalSessions}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalMinutesPracticed}</div>
                    <div className="text-xs text-gray-400 font-medium">{t.totalMinutes}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-300">{t.noConversations}</h2>
              <p className="text-sm text-gray-500 max-w-md">{t.noConversationsDesc}</p>
            </div>

            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="h-12 px-6 text-base font-bold bg-white text-black hover:bg-gray-200 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              {t.startPracticing}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="border border-gray-800 bg-black/50 backdrop-blur-sm cursor-pointer hover:bg-gray-900/50 transition-colors"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="truncate text-white text-white text-transparent text-white text-slate-600">{extractTopicTitle(conversation.topic)}</span>
                    <span className="text-xs text-gray-400">{formatDate(conversation.timestamp)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div>
                      {t.level}:{" "}
                      <span className={`font-semibold ${getDifficultyColor(conversation.difficulty)}`}>
                        {t.difficultyLevels[conversation.difficulty - 1]}
                      </span>
                    </div>
                    <div>
                      {t.duration}:{" "}
                      <span className="font-semibold">
                        {conversation.timeLimit} {t.minutes}
                      </span>
                    </div>
                    <div>
                      {t.messages}: <span className="font-semibold">{conversation.messages.length}</span>
                    </div>
                    <div>
                      Language: <span className="uppercase font-bold">{conversation.language}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button size="sm" onClick={() => handleResume(conversation)} className="gap-2">
                      <Play className="w-4 h-4 mr-2" />
                      {t.resume}
                    </Button>

                    <Button size="icon" variant="destructive" onClick={() => handleDelete(conversation.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Preview Modal */}
      {selectedConversation && (
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col bg-black text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">{extractTopicTitle(selectedConversation.topic)}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {formatDate(selectedConversation.timestamp)} • {selectedConversation.messages.length} {t.messages}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{t.level}:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(selectedConversation.difficulty)}`}
                  >
                    {t.difficultyLevels[selectedConversation.difficulty - 1]}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {selectedConversation.timeLimit} {t.minutes}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase font-bold">{selectedConversation.language}</span>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {selectedConversation.messages.slice(0, 10).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user" ? "bg-emerald-700 text-white" : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <div className="text-xs font-bold mb-1 opacity-70">
                          {message.role === "user" ? t.you || "You" : t.ai || "AI Teacher"}
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="text-right text-xs text-gray-300 mt-1 opacity-60">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedConversation.messages.length > 10 && (
                    <div className="text-center text-gray-400 text-sm py-2">
                      ... and {selectedConversation.messages.length - 10} more messages
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                {t.close || "Close"}
              </Button>
              <Button
                onClick={() => {
                  handleCloseModal()
                  handleResume(selectedConversation)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {t.resume}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
