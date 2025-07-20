"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { VoiceRecorder } from "@/components/voice-recorder"
import { AIVoicePlayer } from "@/components/ai-voice-player"
import { ConversationHistoryModal } from "@/components/conversation-history-modal"
import { Send, RotateCcw, History, Loader2, MessageSquare, User, Bot, Languages } from "lucide-react"

interface PracticeClientContentProps {
  userEmail: string
  initialLanguage?: string
}

export function PracticeClientContent({ userEmail, initialLanguage = "English" }: PracticeClientContentProps) {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ id: string; messages: Array<{ role: "user" | "assistant"; content: string }>; timestamp: Date }>
  >([])
  const conversationEndRef = useRef<HTMLDivElement>(null)

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === "English" ? "Español" : "English")
  }

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    const newConversation = [...conversation, { role: "user" as const, content: message }]
    setConversation(newConversation)
    setCurrentInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newConversation,
          language: currentLanguage,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      setConversation([...newConversation, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Error:", error)
      setConversation([
        ...newConversation,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to transcribe audio")

      const data = await response.json()
      if (data.text) {
        await handleSendMessage(data.text)
      }
    } catch (error) {
      console.error("Error:", error)
      setIsLoading(false)
    }
  }

  const resetConversation = () => {
    if (conversation.length > 0) {
      const newHistoryItem = {
        id: Date.now().toString(),
        messages: conversation,
        timestamp: new Date(),
      }
      setConversationHistory([newHistoryItem, ...conversationHistory])
    }
    setConversation([])
  }

  const loadConversation = (messages: Array<{ role: "user" | "assistant"; content: string }>) => {
    setConversation(messages)
    setShowHistory(false)
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">English Practice</h1>
              <Badge variant="secondary" className="bg-green-900 text-green-300">
                <MessageSquare className="w-3 h-3 mr-1" />
                Active Session
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
              >
                <Languages className="w-4 h-4 mr-2" />
                {currentLanguage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Conversation Area */}
          <Card className="flex-1 bg-gray-900 border-gray-800 mb-4 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto space-y-4 pr-2">
                {conversation.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation by typing or speaking!</p>
                    </div>
                  </div>
                ) : (
                  conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                          {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.role === "assistant" && (
                            <div className="mt-2 flex gap-2">
                              <AIVoicePlayer text={message.content} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-800 text-gray-100">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={conversationEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[60px] bg-gray-800 border-gray-700 text-white resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(currentInput)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceInput}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage(currentInput)}
                    disabled={!currentInput.trim() || isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConversationHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversationHistory}
        onLoadConversation={loadConversation}
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
