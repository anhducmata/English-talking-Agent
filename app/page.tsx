"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Settings, Sparkles, Check, Volume2, Star, Mic, Loader2 } from "lucide-react"
import { CustomCallModal, type CustomCallConfig } from "@/components/custom-call-modal"

import { QuickChatModal } from "@/components/quick-chat-modal"
import { ConversationBuilderModal } from "@/components/conversation-builder-modal"
import { OwlMascot } from "@/components/owl-mascot"
import { cn } from "@/lib/utils"
import { usePrefetch } from "@/hooks/use-prefetch"
import { HomePageSkeleton } from "@/components/page-skeleton"
import { Suspense } from "react"

const translations = {
  en: {
    greeting: "Hi there! I'm Mata!",
    subtitle: "Let's practice English together!",
    chooseMode: "How do you want to practice today?",
    quickCall: "Quick Chat",
    quickCallDesc: "Talk to me right now!",
    aiGenerated: "AI Adventure",
    aiGeneratedDesc: "Let AI pick a fun topic!",
    advanced: "My Own Topic",
    advancedDesc: "Choose what we talk about!",
    startButton: "Let's Go!",
    badge1: "Safe for Kids",
    badge2: "Learn by Talking",
    badge3: "AI Powered",
  },
  vi: {
    greeting: "Chao ban! Minh la Mata!",
    subtitle: "Hay luyen tieng Anh cung nhau nao!",
    chooseMode: "Hom nay ban muon luyen tap nhu the nao?",
    quickCall: "Tro Chuyen Nhanh",
    quickCallDesc: "Noi chuyen voi minh ngay bay gio!",
    aiGenerated: "Cuoc Phieu Luu AI",
    aiGeneratedDesc: "De AI chon chu de vui!",
    advanced: "Chu De Cua Minh",
    advancedDesc: "Chon dieu ban muon noi!",
    startButton: "Bat Dau Nao!",
    badge1: "An Toan Cho Tre Em",
    badge2: "Hoc Qua Noi Chuyen",
    badge3: "AI Thong Minh",
  },
}

const modeOptions = [
  {
    key: "quick" as const,
    icon: MessageCircle,
    color: "bg-primary text-primary-foreground",
    ringColor: "ring-primary",
    bgHover: "hover:bg-primary/90",
    emoji: "💬",
  },
  {
    key: "conversation-builder" as const,
    icon: Sparkles,
    color: "bg-secondary text-secondary-foreground",
    ringColor: "ring-secondary",
    bgHover: "hover:bg-secondary/90",
    emoji: "✨",
  },
  {
    key: "advanced" as const,
    icon: Settings,
    color: "bg-success text-success-foreground",
    ringColor: "ring-success",
    bgHover: "hover:bg-success/90",
    emoji: "🎯",
  },
]

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [selectedOption, setSelectedOption] = useState<"quick" | "advanced" | "conversation-builder">("quick")
  const [showCustomModal, setShowCustomModal] = useState(false)

  const [customModalInitialConfig, setCustomModalInitialConfig] = useState<CustomCallConfig | undefined>(undefined)
  const [conversationPromptData, setConversationPromptData] = useState<
    | { rawTopic: string; conversationMode: string; voice: string; timeLimit: string }
    | undefined
  >(undefined)
  const [showQuickChatModal, setShowQuickChatModal] = useState(false)
  const [isAdventureLaunching, setIsAdventureLaunching] = useState(false)
  const [showConversationBuilderModal, setShowConversationBuilderModal] = useState(false)
  const router = useRouter()
  const t = translations[language]

  const kidsAdventureTopics = [
    "superheroes and their superpowers",
    "dinosaurs and prehistoric animals",
    "space exploration and planets",
    "magic spells and fairy tales",
    "animals and their habitats",
    "my favorite cartoon characters",
    "going on a treasure hunt",
    "robots and futuristic gadgets",
    "underwater sea creatures",
    "a day at a theme park",
    "cooking yummy food",
    "sports and my favorite games",
    "holidays and celebrations",
    "my best friend and fun memories",
    "dragons and mythical creatures",
  ]

  const realtimeVoices = ["alloy", "ash", "coral", "echo", "sage", "shimmer", "verse"]

  const launchAIAdventure = async () => {
    setIsAdventureLaunching(true)
    const randomTopic = kidsAdventureTopics[Math.floor(Math.random() * kidsAdventureTopics.length)]
    const randomVoice = realtimeVoices[Math.floor(Math.random() * realtimeVoices.length)]

    try {
      const response = await fetch("/api/generate-conversation-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawTopic: randomTopic, conversationMode: "chat", language }),
      })

      if (!response.ok) throw new Error("Failed")

      const content = await response.json()
      const searchParams = new URLSearchParams({
        topic: content.topic || randomTopic,
        goal: content.goal || "",
        rules: content.rules || "",
        expectations: content.expectations || "",
        timeLimit: "5",
        voice: randomVoice,
        language,
        mode: "casual-chat",
      })
      router.push(`/practice?${searchParams.toString()}`)
    } catch {
      // Fallback: go with raw topic directly
      const searchParams = new URLSearchParams({
        topic: randomTopic,
        timeLimit: "5",
        voice: randomVoice,
        difficulty: "3",
        language,
        mode: "casual-chat",
      })
      router.push(`/practice?${searchParams.toString()}`)
    } finally {
      setIsAdventureLaunching(false)
    }
  }

  usePrefetch(["/generate-lesson-content", "/generate-conversation-content", "/prepare-interview"], {
    enabled: true,
    delay: 500,
  })

  const handleStartPractice = () => {
    if (selectedOption === "quick") {
      setShowQuickChatModal(true)
    } else if (selectedOption === "advanced") {
      setCustomModalInitialConfig(undefined)
      setConversationPromptData(undefined)
      setShowCustomModal(true)
    } else if (selectedOption === "conversation-builder") {
      launchAIAdventure()
    }
  }

  const handleQuickChatStart = (config: {
    topic: string
    conversationMode: string
    voice: string
    timeLimit: string
  }) => {
    setIsAdventureLaunching(true)
    const searchParams = new URLSearchParams({
      topic: config.topic,
      timeLimit: config.timeLimit,
      voice: config.voice,
      difficulty: "3",
      language,
      mode: config.conversationMode,
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleCustomCall = (config: CustomCallConfig) => {
    setIsAdventureLaunching(true)
    const searchParams = new URLSearchParams({
      topic: config.topic,
      goal: config.goal,
      rules: config.rules,
      expectations: config.expectations,
      timeLimit: config.timeLimit,
      voice: config.voice,
      language,
      mode: config.conversationMode,
    })
    router.push(`/practice?${searchParams.toString()}`)
  }

  const handleOpenCustomModalWithConfig = (
    config: CustomCallConfig,
    promptData?: { rawTopic: string; conversationMode: string; voice: string; timeLimit: string },
  ) => {
    setCustomModalInitialConfig(config)
    setConversationPromptData(promptData)
    setShowCustomModal(true)
  }

  const handleBackToConversationBuilder = () => {
    setShowCustomModal(false)
    setShowConversationBuilderModal(true)
  }

  return (
    <>
      {isAdventureLaunching && <HomePageSkeleton />}
      <div className={cn("min-h-screen bg-background flex flex-col overflow-hidden relative font-sans", isAdventureLaunching && "hidden")}>

        {/* Floating decorative shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-10 left-8 w-16 h-16 rounded-full bg-accent/30 animate-[float1_6s_ease-in-out_infinite]" />
          <div className="absolute top-32 right-12 w-10 h-10 rounded-full bg-secondary/40 animate-[float2_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-40 left-16 w-12 h-12 rounded-full bg-success/30 animate-[float3_7s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 right-8 w-20 h-20 rounded-full bg-primary/20 animate-[float1_9s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-4 w-8 h-8 rounded-full bg-warning/30 animate-[float2_5s_ease-in-out_infinite]" />

          {/* Stars */}
          <Star className="absolute top-20 right-1/4 w-5 h-5 text-accent/50 animate-pulse" fill="currentColor" />
          <Star className="absolute top-1/3 left-1/4 w-4 h-4 text-secondary/40 animate-pulse delay-300" fill="currentColor" />
          <Star className="absolute bottom-1/3 right-1/3 w-6 h-6 text-accent/40 animate-pulse delay-700" fill="currentColor" />
        </div>

        {/* Language toggle */}
        <div className="flex justify-end px-6 pt-5 relative z-10">
          <div className="flex items-center gap-1 bg-card rounded-full shadow-sm border border-border px-2 py-1">
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200",
                language === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("vi")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200",
                language === "vi"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              VI
            </button>
          </div>
        </div>

        {/* Hero section - Owl + greeting */}
        <div className="flex flex-col items-center pt-4 pb-2 px-4 relative z-10">
          {/* Owl mascot with glow ring */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-110 animate-pulse" />
            <div className="relative bg-card rounded-full p-4 shadow-lg border-4 border-primary/30">
              <OwlMascot state="waving" size="xl" />
            </div>
            {/* Sound wave decorations */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex gap-0.5 items-center">
              {[3, 5, 4, 6, 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary/60 animate-[soundwave_1.2s_ease-in-out_infinite]"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex gap-0.5 items-center">
              {[4, 6, 4, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-accent/70 animate-[soundwave_1.2s_ease-in-out_infinite]"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 0.15 + 0.6}s` }}
                />
              ))}
            </div>
          </div>

          {/* Greeting bubble */}
          <div className="bg-card rounded-3xl px-6 py-3 shadow-md border-2 border-primary/20 max-w-xs text-center mb-2">
            <p className="text-foreground font-extrabold text-xl leading-tight text-balance">{t.greeting}</p>
          </div>

          {/* Mode selection */}
          <p className="text-foreground font-bold text-center mb-4">{t.chooseMode}</p>
          <div className="flex gap-3 justify-center mb-8">
            {modeOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.key}
                  onClick={() => setSelectedOption(option.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200",
                    "border-2 border-border",
                    selectedOption === option.key
                      ? `${option.color} ring-2 ${option.ringColor} scale-105 shadow-lg`
                      : "bg-card hover:bg-accent/10 text-foreground"
                  )}
                >
                  <div className="text-2xl">{option.emoji}</div>
                  <span className="text-xs font-bold text-center">
                    {option.key === "quick"
                      ? t.quickCall
                      : option.key === "conversation-builder"
                        ? t.aiGenerated
                        : t.advanced}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Description text */}
          <p className="text-xs text-muted-foreground text-center mb-6 px-4">
            {selectedOption === "quick"
              ? t.quickCallDesc
              : selectedOption === "conversation-builder"
                ? t.aiGeneratedDesc
                : t.advancedDesc}
          </p>

          {/* Big CTA button */}
          <Button
            onClick={handleStartPractice}
            disabled={isAdventureLaunching}
            className="max-w-xs px-8 h-16 text-xl font-extrabold rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-b-4 border-primary/60 disabled:opacity-80 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isAdventureLaunching ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                {language === "en" ? "Loading..." : "Dang tai..."}
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                {t.startButton}
              </>
            )}
          </Button>
        </div>

        {/* Modals */}
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

        <QuickChatModal
          isOpen={showQuickChatModal}
          onClose={() => setShowQuickChatModal(false)}
          onStartChat={handleQuickChatStart}
          language={language}
        />

        <ConversationBuilderModal
          isOpen={showConversationBuilderModal}
          onClose={() => setShowConversationBuilderModal(false)}
          onOpenCustomModal={handleOpenCustomModalWithConfig}
          language={language}
        />

        <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .border-3 {
          border-width: 3px;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
      </div>
    </>
  )
}
