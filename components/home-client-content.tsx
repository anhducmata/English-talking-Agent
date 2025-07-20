"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Mic, BookOpen, TrendingUp, Play, Users, Globe, Zap } from "lucide-react"
import Link from "next/link"

interface HomeClientContentProps {
  userEmail: string
}

export function HomeClientContent({ userEmail }: HomeClientContentProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const features = [
    {
      id: "conversation",
      icon: MessageCircle,
      title: "AI Conversation Practice",
      description: "Practice speaking with AI tutors in realistic scenarios",
      color: "from-blue-500 to-cyan-500",
      href: "/practice",
    },
    {
      id: "pronunciation",
      icon: Mic,
      title: "Pronunciation Training",
      description: "Get real-time feedback on your pronunciation",
      color: "from-purple-500 to-pink-500",
      href: "/pronunciation",
    },
    {
      id: "vocabulary",
      icon: BookOpen,
      title: "Vocabulary Builder",
      description: "Learn new words in context with spaced repetition",
      color: "from-green-500 to-emerald-500",
      href: "/vocabulary",
    },
    {
      id: "progress",
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics",
      color: "from-orange-500 to-red-500",
      href: "/progress",
    },
  ]

  const stats = [
    { label: "Conversations", value: "1,234", icon: MessageCircle },
    { label: "Words Learned", value: "567", icon: BookOpen },
    { label: "Hours Practiced", value: "89", icon: Play },
    { label: "Streak Days", value: "12", icon: Zap },
  ]

  return (
    <main className="container mx-auto px-6 py-12 relative z-10">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-300">Welcome back, {userEmail.split("@")[0]}!</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Master English
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Practice conversations, improve pronunciation, and build vocabulary with AI-powered language learning
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/practice">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold">
              <Play className="w-5 h-5 mr-2" />
              Start Practicing
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-white/10 bg-transparent">
            <Users className="w-5 h-5 mr-2" />
            Join Community
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-sm border-gray-800 hover:bg-white/10 transition-all duration-300"
          >
            <CardContent className="p-6 text-center">
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {features.map((feature) => (
          <Link key={feature.id} href={feature.href}>
            <Card
              className="bg-white/5 backdrop-blur-sm border-gray-800 hover:bg-white/10 transition-all duration-500 cursor-pointer group h-full"
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`h-1 bg-gradient-to-r ${feature.color} rounded-full transition-all duration-500 ${
                    hoveredCard === feature.id ? "w-full" : "w-0"
                  }`}
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 cursor-pointer px-4 py-2">
            <MessageCircle className="w-4 h-4 mr-2" />
            Daily Conversation
          </Badge>
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 cursor-pointer px-4 py-2">
            <Mic className="w-4 h-4 mr-2" />
            Pronunciation Check
          </Badge>
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 cursor-pointer px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Word of the Day
          </Badge>
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 cursor-pointer px-4 py-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Weekly Report
          </Badge>
        </div>
      </div>
    </main>
  )
}
