"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, MessageCircle, Mic, Volume2, BookOpen, Target, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

interface HomeClientContentProps {
  userEmail: string
}

export function HomeClientContent({ userEmail }: HomeClientContentProps) {
  const [language, setLanguage] = useState<"en" | "vi">("en")

  const features = [
    {
      icon: MessageCircle,
      title: "AI Conversation",
      description: "Practice speaking with our advanced AI tutor that adapts to your level",
      color: "bg-blue-500",
    },
    {
      icon: Mic,
      title: "Voice Recognition",
      description: "Get real-time feedback on your pronunciation and speaking clarity",
      color: "bg-green-500",
    },
    {
      icon: Volume2,
      title: "Natural Speech",
      description: "Listen to natural, human-like AI voice responses",
      color: "bg-purple-500",
    },
    {
      icon: BookOpen,
      title: "Topic Variety",
      description: "Choose from hundreds of conversation topics and scenarios",
      color: "bg-orange-500",
    },
  ]

  const stats = [
    { label: "Practice Sessions", value: "0", icon: Target },
    { label: "Speaking Time", value: "0 min", icon: Clock },
    { label: "Improvement", value: "0%", icon: TrendingUp },
  ]

  return (
    <main className="flex-1 relative z-10">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-gray-800 text-gray-200 border-gray-700">
            Welcome back, {userEmail.split("@")[0]}!
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Master English Through
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Conversation
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Practice speaking English naturally with our AI-powered conversation partner. Get instant feedback, improve
            your pronunciation, and build confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/practice">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4 text-lg">
                Start Practicing Now
                <MessageCircle className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              className="gap-2 text-lg font-semibold h-14 px-8 border-2 border-gray-700 bg-transparent text-white hover:bg-gray-900 hover:border-gray-600"
            >
              <Globe className="w-5 h-5" />
              {language === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Our AI English Tutor?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the future of language learning with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-800/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your English?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have improved their English speaking skills with our AI tutor. Start your
              journey today!
            </p>
            <Link href="/practice">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4 text-lg">
                Begin Your First Session
                <MessageCircle className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
