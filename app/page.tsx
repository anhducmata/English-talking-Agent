"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Settings, Check, Sparkles } from "lucide-react"
import { CustomCallModal, type CustomCallConfig } from "@/components/custom-call-modal"
import { ConversationBuilderModal } from "@/components/conversation-builder-modal"
import { cn } from "@/lib/utils"
import { HomePageSkeleton } from "@/components/page-skeleton"
import { usePrefetch } from "@/hooks/use-prefetch"

const translations = {
  en: {
    title: "SpeakEasy",
    subtitle: "Practice English with AI conversations",
    startPractice: "Start Practice!",
    choosePracticeStyle: "Choose your practice style",
    quickCall: "Quick Chat",
    quickCallDescription: "Start chatting right away",
    advanced: "Advanced",
    advancedDescription: "Create your own conversation",
    conversationBuilder: "Conversation Builder",
    conversationBuilderDescription: "AI helps set up your conversation",
    selectOption: "Please select a practice option to continue",
    quickChatDetailedDescription:
      "Selected Quick Chat mode. This will be a simple, free-flowing conversation to help you practice speaking naturally without formal analysis.",
    conversationBuilderDetailedDescription:
      "Selected Conversation Builder mode. AI will guide you through setting up a structured conversation based on your specific goals and preferences.",
    advancedDetailedDescription:
      "Selected Advanced mode. This allows you to fully customize your conversation scenario, including topic, rules, and expectations.",
  },
  vi: {
    title: "SpeakEasy",
    subtitle: "Luyện tập tiếng Anh với cuộc trò chuyện AI",
    startPractice: "Bắt Đầu Luyện Tập!",
    choosePracticeStyle: "Chọn phong cách luyện tập của bạn",
    quickCall: "Trò Chuyện Nhanh",
    quickCallDescription: "Bắt đầu trò chuyện ngay lập tức",
    advanced: "Nâng Cao",
    advancedDescription: "Tạo cuộc hội thoại của riêng bạn",
    conversationBuilder: "Tạo Cuộc Hội Thoại",
    conversationBuilderDescription: "AI giúp thiết lập cuộc hội thoại của bạn",
    selectOption: "Vui lòng chọn một tùy chọn luyện tập để tiếp tục",
    quickChatDetailedDescription:
      "Đã chọn chế độ Trò Chuyện Nhanh. Đây sẽ là một cuộc trò chuyện đơn giản, tự do để giúp bạn luyện nói một cách tự nhiên mà không cần phân tích chính thức.",
    conversationBuilderDetailedDescription:
      "Đã chọn chế độ Tạo Cuộc Hội Thoại. AI sẽ hướng dẫn bạn thiết lập một cuộc trò chuyện có cấu trúc dựa trên mục tiêu và sở thích cụ thể của bạn.",
    advancedDetailedDescription:
      "Đã chọn chế độ Nâng Cao. Chế độ này cho phép bạn tùy chỉnh hoàn toàn kịch bản cuộc trò chuyện của mình, bao gồm chủ đề, quy tắc và kỳ vọng.",
  },
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [selectedOption, setSelectedOption] = useState<"quick" | "advanced" | "conversation-builder" | null>("quick")
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [showConversationBuilderModal, setShowConversationBuilderModal] = useState(false)
  const [customModalInitialConfig, setCustomModalInitialConfig] = useState<CustomCallConfig | undefined>(undefined)
  const [conversationPromptData, setConversationPromptData] = useState<
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

  // Prefetch common API endpoints
  usePrefetch(["/generate-lesson-content", "/generate-conversation-content", "/prepare-interview"], {
    enabled: true,
    delay: 1000, // Prefetch after 1 second
  })

  // Simulate loading state with realistic timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Reduced loading time due to prefetching

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <HomePageSkeleton />
  }

  const handleQuickCall = () => {
    const searchParams = new URLSearchParams({
      topic: "General English Conversation",
      timeLimit: "5",
      voice: "alloy",
      difficulty: "3",
      mode: "casual-chat",
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleCustomCall = (config: CustomCallConfig) => {
    const searchParams = new URLSearchParams({
      topic: config.topic,
      goal: config.goal,
      rules: config.rules,
      expectations: config.expectations,
      timeLimit: config.timeLimit,
      voice: config.voice,
      mode: config.conversationMode,
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
    setConversationPromptData(promptData)
    setShowCustomModal(true)
  }

  const handleBackToConversationBuilder = () => {
    setShowCustomModal(false)
    setShowConversationBuilderModal(true)
  }

  const handleStartPractice = () => {
    if (selectedOption === "quick") {
      handleQuickCall()
    } else if (selectedOption === "advanced") {
      setCustomModalInitialConfig(undefined)
      setConversationPromptData(undefined)
      setShowCustomModal(true)
    } else if (selectedOption === "conversation-builder") {
      setShowConversationBuilderModal(true)
    }
  }

  const getDynamicModeDescription = () => {
    if (selectedOption === "quick") {
      return t.quickChatDetailedDescription
    } else if (selectedOption === "conversation-builder") {
      return t.conversationBuilderDetailedDescription
    } else if (selectedOption === "advanced") {
      return t.advancedDetailedDescription
    } else {
      return t.selectOption
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden flex flex-col items-center justify-center p-4">
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

      {/* Top Navigation */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/history")}
          className="text-gray-400 hover:text-white hover:bg-transparent"
        >
          History
        </Button>

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

      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          <p className="text-sm text-gray-300">{t.subtitle}</p>
        </div>

        {/* Start Practice Button */}
        <div className="w-full">
          <Button
            onClick={handleStartPractice}
            disabled={!selectedOption}
            className="w-full bg-white hover:bg-gray-200 text-black py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.startPractice}
          </Button>
        </div>

        {/* Practice Style Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white text-center">{t.choosePracticeStyle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Quick Call Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "quick"
                  ? "ring-1 ring-white bg-gray-800 border-white"
                  : "border-gray-600 hover:border-gray-500 bg-gray-800"
              }`}
              onClick={() => setSelectedOption("quick")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  {selectedOption === "quick" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{t.quickCall}</h3>
                  <p className="text-xs text-gray-400">{t.quickCallDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Builder Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "conversation-builder"
                  ? "ring-1 ring-white bg-gray-800 border-white"
                  : "border-gray-600 hover:border-gray-500 bg-gray-800"
              }`}
              onClick={() => setSelectedOption("conversation-builder")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  {selectedOption === "conversation-builder" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{t.conversationBuilder}</h3>
                  <p className="text-xs text-gray-400">{t.conversationBuilderDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Option */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedOption === "advanced"
                  ? "ring-1 ring-white bg-gray-800 border-white"
                  : "border-gray-600 hover:border-gray-500 bg-gray-800"
              }`}
              onClick={() => setSelectedOption("advanced")}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  {selectedOption === "advanced" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{t.advanced}</h3>
                  <p className="text-xs text-gray-400">{t.advancedDescription}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-400 text-xs">{getDynamicModeDescription()}</p>
        </div>
      </div>

      {/* Custom Call Modal */}
      <CustomCallModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false)
          setCustomModalInitialConfig(undefined)
          setConversationPromptData(undefined)
        }}
        onStartCall={handleCustomCall}
        onBackToAiBuilder={conversationPromptData ? handleBackToConversationBuilder : undefined}
        language={language}
        initialConfig={customModalInitialConfig}
      />

      {/* Conversation Builder Modal */}
      <ConversationBuilderModal
        isOpen={showConversationBuilderModal}
        onClose={() => setShowConversationBuilderModal(false)}
        onOpenCustomModal={handleOpenCustomModalWithConfig}
        language={language}
        initialData={conversationPromptData}
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
