"use client"

import { requireAuth, redirect } from "@/lib/auth"
import { PracticeClientContent } from "@/components/practice-client-content"
import { UserProfileDropdown } from "@/components/user-profile-dropdown"
import { Globe } from "lucide-react"
import Link from "next/link"

export default async function PracticePageWrapper() {
  const user = await requireAuth()

  if (!user) {
    redirect("/auth/login")
  }

  const translations = {
    en: {
      backToSetup: "Back to Setup",
      practiceSession: "Practice Session",
      timeRemaining: "Time Remaining",
      difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Int", "Advanced"],
    },
    vi: {
      backToSetup: "Quay Lại Cài Đặt",
      practiceSession: "Buổi Luyện Tập",
      timeRemaining: "Thời Gian Còn Lại",
      difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
    },
  }

  const t = translations[user.language || "en"]

  const extractTopicTitle = (fullTopic: string) => {
    if (fullTopic.includes("# ") && fullTopic.includes(" - Speaking Practice")) {
      const titleLine = fullTopic.split("\n")[0]
      return titleLine.replace("# ", "").replace(" - Speaking Practice", "")
    }
    return fullTopic.length > 50 ? fullTopic.substring(0, 50) + "..." : fullTopic
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
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">English Practice</h1>
                  <p className="text-sm text-gray-400 font-medium">Practice Session</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <UserProfileDropdown email={user.email} />
            </div>
          </div>
        </div>
      </header>

      <PracticeClientContent
        userEmail={user.email}
        topic={user.topic}
        timeLimit={user.timeLimit}
        difficulty={user.difficulty}
        voice={user.voice}
        initialLanguage={user.language || "en"}
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
