"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Mic, Send, RotateCcw, Settings, MessageCircle, Clock, Zap } from "lucide-react"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ConversationHistoryModal } from "@/components/conversation-history-modal"

interface PracticeClientContentProps {
  userEmail: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

export function PracticeClientContent({ userEmail }: PracticeClientContentProps) {
  const [mode, setMode] = useState<"voice" | "text">("voice")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messageCount: 0,
    accuracy: 0,
  })
  const [showHistory, setShowHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (sessionStarted) {
      sessionTimerRef.current = setInterval(() => {
        setSessionStats((prev) => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [sessionStarted])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateTopic = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      })
      const data = await response.json()
      setTopic(data.topic)
    } catch (error) {
      console.error("Failed to generate topic:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async () => {
    if (!topic) {
      await generateTopic()
      return
    }

    setSessionStarted(true)
    setMessages([])
    setSessionStats({ duration: 0, messageCount: 0, accuracy: 0 })

    // Send initial AI message
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Hello! I'm excited to practice English with you today. Our topic is "${topic}". Let's start with a simple question: What interests you most about this topic?`,
      timestamp: new Date(),
    }
    setMessages([initialMessage])
  }

  const endSession = () => {
    setSessionStarted(false)
    setIsRecording(false)
    setIsSpeaking(false)
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current)
    }
  }

  const sendMessage = async (content: string, audioBlob?: Blob) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topic,
          difficulty,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setSessionStats((prev) => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        accuracy: Math.min(95, prev.accuracy + Math.random() * 5),
      }))
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceRecording = (audioBlob: Blob) => {
    // Convert audio to text (placeholder)
    sendMessage("Voice message received", audioBlob)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <main className="flex-1 relative z-10">
      <div className="container mx-auto px-6 py-8 h-full">
        {!sessionStarted ? (
          // Setup Screen
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Start Your Practice Session</h2>
              <p className="text-gray-400 text-lg">Choose your preferences and begin practicing</p>
            </div>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Session Setup</CardTitle>
                <CardDescription className="text-gray-400">Customize your practice experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Practice Mode</label>
                  <Tabs value={mode} onValueChange={(value) => setMode(value as "voice" | "text")}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                      <TabsTrigger value="voice" className="data-[state=active]:bg-blue-600">
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Practice
                      </TabsTrigger>
                      <TabsTrigger value="text" className="data-[state=active]:bg-blue-600">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Text Practice
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Conversation Topic</label>
                  <div className="flex gap-2">
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter a topic or generate one automatically..."
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={generateTopic}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700 px-4"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={startSession}
                  disabled={!topic || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  {isLoading ? "Generating Topic..." : "Start Practice Session"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Practice Session Screen
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Session Header */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{topic}</h3>
                      <p className="text-gray-400 text-sm capitalize">
                        {difficulty} • {mode} mode
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTime(sessionStats.duration)}</span>
                      </div>
                      <Button
                        onClick={endSession}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm flex-1 flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.audioUrl && (
                            <audio controls className="mt-2 w-full">
                              <source src={message.audioUrl} type="audio/webm" />
                            </audio>
                          )}
                          <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  {mode === "voice" ? (
                    <VoiceRecorder
                      onRecordingComplete={handleVoiceRecording}
                      isRecording={isRecording}
                      onRecordingStateChange={setIsRecording}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage(currentMessage)
                          }
                        }}
                      />
                      <Button
                        onClick={() => sendMessage(currentMessage)}
                        disabled={!currentMessage.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Session Stats */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-medium">{formatTime(sessionStats.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Messages</span>
                    <span className="text-white font-medium">{sessionStats.messageCount}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-green-400 font-medium">{sessionStats.accuracy.toFixed(0)}%</span>
                    </div>
                    <Progress value={sessionStats.accuracy} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowHistory(true)}
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={() => {
                      setMessages([])
                      setSessionStats({ duration: 0, messageCount: 0, accuracy: 0 })
                    }}
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Conversation History Modal */}
      <ConversationHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} messages={messages} />
    </main>
  )
}
