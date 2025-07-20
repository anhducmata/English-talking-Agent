"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MessageSquare, BookOpen, Zap, Globe } from "lucide-react"
import Link from "next/link"

interface HomeClientContentProps {
  userEmail: string
}

export function HomeClientContent({ userEmail }: HomeClientContentProps) {
  const [currentLanguage, setCurrentLanguage] = useState("English")

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === "English" ? "Español" : "English")
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

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 bg-gray-800 text-gray-300 hover:bg-gray-700">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Learning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Master English with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                AI Conversations
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Practice speaking English naturally with our AI tutor. Get instant feedback, improve pronunciation, and
              build confidence through real conversations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/practice">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3">
                <Mic className="w-5 h-5 mr-2" />
                Start Speaking
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 bg-transparent"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
                <p className="text-gray-400">
                  Engage in realistic dialogues with our AI tutor that adapts to your level and interests.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6">
                <Mic className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Voice Recognition</h3>
                <p className="text-gray-400">
                  Advanced speech recognition technology provides accurate pronunciation feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Cultural Context</h3>
                <p className="text-gray-400">Learn not just the language, but also cultural nuances and expressions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
