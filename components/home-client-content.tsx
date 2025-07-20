"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Globe, MessageCircle, Mic, Volume2, Trophy, Clock, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

interface HomeClientContentProps {
  userEmail: string
}

export function HomeClientContent({ userEmail }: HomeClientContentProps) {
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [progress, setProgress] = useState(65)

  useEffect(() => {
    // Simulate progress loading
    const timer = setTimeout(() => setProgress(75), 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { icon: Clock, label: "Practice Time", value: "24h 32m", color: "text-blue-400" },
    { icon: MessageCircle, label: "Conversations", value: "127", color: "text-green-400" },
    { icon: Target, label: "Accuracy", value: "89%", color: "text-yellow-400" },
    { icon: TrendingUp, label: "Improvement", value: "+12%", color: "text-purple-400" },
  ]

  const recentTopics = [
    { title: "Business Meeting", difficulty: "Advanced", completed: true },
    { title: "Travel Planning", difficulty: "Intermediate", completed: true },
    { title: "Restaurant Order", difficulty: "Beginner", completed: false },
    { title: "Job Interview", difficulty: "Advanced", completed: false },
  ]

  return (
    <main className="flex-1 relative z-10">
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {userEmail.split("@")[0]}! 👋</h2>
          <p className="text-gray-400 text-lg">Ready to improve your English conversation skills?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Practice Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Start */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Start Practicing
                </CardTitle>
                <CardDescription className="text-gray-400">Choose your preferred practice mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/practice">
                    <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center gap-2">
                      <Mic className="w-6 h-6" />
                      <span className="font-semibold">Voice Practice</span>
                      <span className="text-xs opacity-80">Real-time conversation</span>
                    </Button>
                  </Link>
                  <Link href="/practice?mode=text">
                    <Button className="w-full h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center gap-2">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-semibold">Text Practice</span>
                      <span className="text-xs opacity-80">Written conversation</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Topics */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Recent Topics
                </CardTitle>
                <CardDescription className="text-gray-400">Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${topic.completed ? "bg-green-400" : "bg-gray-500"}`} />
                        <div>
                          <p className="text-white font-medium">{topic.title}</p>
                          <p className="text-gray-400 text-sm">{topic.difficulty}</p>
                        </div>
                      </div>
                      <Badge variant={topic.completed ? "default" : "secondary"}>
                        {topic.completed ? "Completed" : "Continue"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Settings */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Your Progress
                </CardTitle>
                <CardDescription className="text-gray-400">Weekly improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Overall Progress</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pronunciation</span>
                    <span className="text-green-400">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vocabulary</span>
                    <span className="text-blue-400">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Grammar</span>
                    <span className="text-yellow-400">81%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Language Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={language} onValueChange={(value) => setLanguage(value as "en" | "vi")}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                    <TabsTrigger value="en" className="data-[state=active]:bg-blue-600">
                      English
                    </TabsTrigger>
                    <TabsTrigger value="vi" className="data-[state=active]:bg-blue-600">
                      Tiếng Việt
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="mt-4">
                    <p className="text-gray-400 text-sm">Practice English conversation with AI assistance</p>
                  </TabsContent>
                  <TabsContent value="vi" className="mt-4">
                    <p className="text-gray-400 text-sm">Luyện tập hội thoại tiếng Anh với sự hỗ trợ của AI</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Achievements
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Practice History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
