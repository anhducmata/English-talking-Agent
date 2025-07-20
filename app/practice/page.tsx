"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type SpeechRecognition from "speech-recognition"
import { ConversationHistoryModal } from "@/components/conversation-history-modal"
import {
  loadConversationById,
  saveConversation,
  generateConversationId,
  type SavedConversation,
} from "@/lib/conversation-storage"

// Export the interface so it can be used by lib/conversation-storage.ts
export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

// Declare SpeechRecognition and SpeechGrammarList for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition
    webkitSpeechGrammarList: any
  }
}

export default function PracticePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get settings from URL params
  const topic = searchParams.get("topic") || ""
  const timeLimit = Number.parseInt(searchParams.get("timeLimit") || "10")
  const difficulty = Number.parseInt(searchParams.get("difficulty") || "3")
  const voice = searchParams.get("voice") || "alloy"
  const language = (searchParams.get("language") || "en") as "en" | "vi"

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const actualTimeLimit = [1, 2, 3, 5, 8, 10][timeLimit - 1] || timeLimit
  const [timeRemaining, setTimeRemaining] = useState(actualTimeLimit * 60)
  const [isCallActive, setIsCallActive] = useState(false)
  const [pendingUserMessageId, setPendingUserMessageId] = useState<string | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isSpeakingDetected, setIsSpeakingDetected] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const pendingUserMessageIdRef = useRef<string | null>(null)
  const userScrolledUpRef = useRef(false)

  // Web Speech API related refs
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
  const silenceTimerIdRef = useRef<NodeJS.Timeout | null>(null)
  const SILENCE_DURATION_MS = 2000

  // VAD related refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const silenceStartTimeRef = useRef<number | null>(null)
  const SILENCE_THRESHOLD = 20
  const dataArrayRef = useRef<Uint8Array | null>(null)

  const translations = {
    en: {
      backToSetup: "Back to Setup",
      practiceSession: "Practice Session",
      timeRemaining: "Time Remaining",
      startCall: "Start Call",
      endCall: "End Call",
      listening: "Listening...",
      processing: "Processing...",
      aiThinking: "AI is thinking...",
      you: "You",
      ai: "AI Teacher",
      tapToSpeak: "Click to Speak",
      speaking: "Speaking...",
      readyToStart: "Ready to Practice?",
      startDescription: "Click to start your conversation practice session",
      difficultyLevels: ["Beginner", "Elementary", "Intermediate", "Upper-Int", "Advanced"],
      autoStopped: "Recording stopped automatically due to silence.",
      speakButton: "Speak",
      sendButton: "Send",
      speechApiNotSupported: "Speech recognition not supported in this browser.",
      understandingMessage: "We are trying to understand your message...",
      transcriptionFailed: "Transcription failed. Please try again.",
      errorOccurred: "An error occurred. Please try again.",
      viewHistory: "View Full Conversation",
      analyzing: "Analyzing conversation...",
      metExpectations: "Met Expectations",
      exceededExpectations: "Exceeded Expectations",
      belowExpectations: "Below Expectations",
    },
    vi: {
      backToSetup: "Quay Lại Cài Đặt",
      practiceSession: "Buổi Luyện Tập",
      timeRemaining: "Thời Gian Còn Lại",
      startCall: "Bắt Đầu Cuộc Gọi",
      endCall: "Kết Thúc Cuộc Gọi",
      listening: "Đang Nghe...",
      processing: "Đang Xử Lý...",
      aiThinking: "AI đang suy nghĩ...",
      you: "Bạn",
      ai: "AI Giáo Viên",
      tapToSpeak: "Nhấn để nói",
      speaking: "Đang Nói...",
      readyToStart: "Sẵn Sàng Luyện Tập?",
      startDescription: "Nhấn để bắt đầu buổi luyện tập hội thoại",
      difficultyLevels: ["Cơ bản", "Sơ cấp", "Trung cấp", "Khá", "Nâng cao"],
      autoStopped: "Ghi âm tự động dừng do im lặng.",
      speakButton: "Nói",
      sendButton: "Gửi",
      speechApiNotSupported: "Trình duyệt này không hỗ trợ nhận dạng giọng nói.",
      understandingMessage: "Chúng tôi đang cố gắng hiểu tin nhắn của bạn...",
      transcriptionFailed: "Chuyển đổi giọng nói thất bại. Vui lòng thử lại.",
      errorOccurred: "Đã xảy ra lỗi. Vui lòng thử lại.",
      viewHistory: "Xem Toàn Bộ Hội Thoại",
      analyzing: "Đang phân tích hội thoại...",
      metExpectations: "Đạt Kỳ Vọng",
      exceededExpectations: "Vượt Kỳ Vọng",
      belowExpectations: "Chưa Đạt Kỳ Vọng",
    },
  }

  const t = translations[language]

  // Update the analysisResult state type to include enhanced analysis with new scoring
  const [analysisResult, setAnalysisResult] = useState<{
    componentScores?: {
      fluency: number
      pronunciation: number
      grammar: number
      vocabulary: number
      contentRichness: number
    }
    baseScore?: number
    lengthBonus?: number
    rawScore?: number
    finalScore?: number
    expectationScore: number
    metExpectations?: boolean
    speakingMetrics?: {
      totalWords: number
      estimatedSeconds: number
      idealSeconds: number
      speakingRatio: number
    }
    strengths: string[]
    improvements: string[]
    feedback: string
    suggestions?: Array<{
      type: "sentence" | "vocabulary" | "grammar" | "expression"
      original: string
      alternative: string
      explanation: string
      category: "Grammar" | "Vocabulary" | "Natural Expression" | "Pronunciation Guide"
    }>
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [translationsData, setTranslations] = useState<Record<string, string>>({})
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({})

  const [analysisTranslations, setAnalysisTranslations] = useState<Record<string, string>>({})
  const [loadingAnalysisTranslations, setLoadingAnalysisTranslations] = useState<Record<string, boolean>>({})

  const [hasPlayedWarning, setHasPlayedWarning] = useState(false)

  // Keep pendingUserMessageIdRef in sync with pendingUserMessageId state
  useEffect(() => {
    pendingUserMessageIdRef.current = pendingUserMessageId
  }, [pendingUserMessageId])

  const extractTopicTitle = (fullTopic: string) => {
    // If it's a structured prompt, extract just the title
    if (fullTopic.includes("# ") && fullTopic.includes(" - Speaking Practice")) {
      const titleLine = fullTopic.split("\n")[0]
      return titleLine.replace("# ", "").replace(" - Speaking Practice", "")
    }

    // If it's a simple topic, return first 50 characters
    return fullTopic.length > 50 ? fullTopic.substring(0, 50) + "..." : fullTopic
  }

  const [conversationId, setConversationId] = useState<string | null>(null)

  // Effect to load conversation if ID is provided in URL
  const conversationIdParam = searchParams.get("conversationId")
  useEffect(() => {
    if (conversationIdParam) {
      const loaded = loadConversationById(conversationIdParam)
      if (loaded) {
        setConversationId(loaded.id)
        setConversation(loaded.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })))
        setTimeRemaining(loaded.timeLimit * 60)
        return
      }
    }
    // new session fallback
    setConversationId(generateConversationId())
  }, [conversationIdParam])

  // Timer countdown
  useEffect(() => {
    if (isCallActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          // Play warning beep at 10 seconds remaining
          if (prev === 10 && !hasPlayedWarning) {
            setHasPlayedWarning(true)
            playWarningBeep()
          }

          if (prev <= 1) {
            // Auto-end call when time runs out
            endCall(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
    // Save conversation when time runs out or call ends
    if (!isCallActive && conversation.length > 0 && conversationId) {
      const actualTimeLimitMinutes = [1, 2, 3, 5, 8, 10][timeLimit - 1] || 1
      const savedConv: SavedConversation = {
        id: conversationId,
        topic: topic,
        difficulty: difficulty,
        timeLimit: actualTimeLimitMinutes,
        voice: voice,
        language: language,
        timestamp: Date.now(),
        messages: conversation.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.getTime(),
        })),
      }
      saveConversation(savedConv)
    }
  }, [
    isCallActive,
    timeRemaining,
    hasPlayedWarning,
    conversation,
    conversationId,
    topic,
    difficulty,
    timeLimit,
    voice,
    language,
  ])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setIsCallActive(true)
      setHasPlayedWarning(false)

      // If resuming an existing conversation, don't generate a new greeting
      if (conversation.length > 0 && conversationId) {
        // The conversation is already loaded from localStorage
        // Just ensure the last AI message is played if it exists and has audioUrl
        const lastAIMessage = conversation.findLast((msg) => msg.role === "assistant" && msg.audioUrl)
        if (lastAIMessage && currentAudioRef.current) {
          // If there's a last AI message and it has an audio URL, play it
          currentAudioRef.current.src = lastAIMessage.audioUrl!
          currentAudioRef.current.play()
        }
        return // Exit, as we are resuming
      }

      // For new conversations, generate initial AI greeting
      setIsAIThinking(true)
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Hi! I want to practice ${topic}. Can you start our conversation?`,
              },
            ],
            topic,
            difficulty,
            language,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          const greeting = result.message

          const aiMessage: ConversationMessage = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: greeting,
            timestamp: new Date(),
            audioUrl: undefined,
          }

          setConversation([aiMessage])
          generateAISpeech(greeting, aiMessage.id)
        }
      } catch (error) {
        console.error("Error generating greeting:", error)
        // Fallback greeting
        const fallbackGreeting =
          language === "en"
            ? `Hello! I'm ready to help you practice ${topic}. How can we start?`
            : `Xin chào! Tôi sẵn sàng giúp bạn luyện tập ${topic}. Chúng ta bắt đầu như thế nào?`

        const aiMessage: ConversationMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: fallbackGreeting,
          timestamp: new Date(),
          audioUrl: undefined,
        }
        setConversation([aiMessage])
        generateAISpeech(fallbackGreeting, aiMessage.id)
      } finally {
        setIsAIThinking(false)
      }
    } catch (error) {
      console.error("Error starting call:", error)
    }
  }

  const endCall = async (autoEnded = false) => {
    // Stop all audio streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Stop any currently playing TTS audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Stop SpeechRecognition if active
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }
    if (silenceTimerIdRef.current) {
      clearTimeout(silenceTimerIdRef.current)
      silenceTimerIdRef.current = null
    }

    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Stop VAD monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    silenceStartTimeRef.current = null
    setIsSpeakingDetected(false)

    // Save conversation before ending
    if (conversation.length > 0 && conversationId) {
      const actualTimeLimitMinutes = [1, 2, 3, 5, 8, 10][timeLimit - 1] || 1
      const savedConv: SavedConversation = {
        id: conversationId,
        topic: topic,
        difficulty: difficulty,
        timeLimit: actualTimeLimitMinutes,
        voice: voice,
        language: language,
        timestamp: Date.now(),
        messages: conversation.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.getTime(),
        })),
      }
      saveConversation(savedConv)
    }

    setIsCallActive(false)
    setIsRecording(false)
    setCurrentTranscript("")
    setIsProcessing(false)
    setIsAIThinking(false)
    setPendingUserMessageId(null)

    // Analyze the conversation if there are messages
    if (conversation.length > 0) {
      setIsAnalyzing(true)
      try {
        const response = await fetch("/api/analyze-conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation,
            topic,
            difficulty,
            timeLimit: actualTimeLimit,
            language,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setAnalysisResult(result)
        }
      } catch (error) {
        console.error("Analysis error:", error)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const monitorSilence = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !isRecording) {
      setIsSpeakingDetected(false)
      return
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    let sum = 0
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i]
    }
    const averageVolume = sum / dataArrayRef.current.length

    // Update speaking detection state for visual indicator
    setIsSpeakingDetected(averageVolume > SILENCE_THRESHOLD)

    animationFrameRef.current = requestAnimationFrame(monitorSilence)
  }, [isRecording, SILENCE_THRESHOLD])

  const startRecording = useCallback(async () => {
    if (!streamRef.current) return

    if (!("webkitSpeechRecognition" in window)) {
      alert(t.speechApiNotSupported)
      return
    }

    // Stop any currently playing AI audio when user starts speaking
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }

    try {
      // Setup Web Audio API for volume monitoring (for visual indicator)
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)

      source.connect(analyserRef.current)

      // Start monitoring silence/volume for visual indicator
      monitorSilence()

      // Initialize MediaRecorder for actual audio capture
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)

        try {
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")
          formData.append("language", language)

          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            const transcribedText = result.text

            // Add the final user message with transcribed text and audioUrl
            const userMessage: ConversationMessage = {
              id: `user-${Date.now()}`,
              role: "user",
              content: transcribedText,
              timestamp: new Date(),
              audioUrl: audioUrl,
            }
            setConversation((prev) => [...prev, userMessage])

            // Continue with AI response generation...
            setIsAIThinking(true)
            try {
              const chatResponse = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [
                    ...conversation.map((msg) => ({
                      role: msg.role,
                      content: msg.content,
                    })),
                    { role: "user", content: transcribedText },
                  ],
                  topic,
                  difficulty,
                  language,
                }),
              })

              if (chatResponse.ok) {
                const chatResult = await chatResponse.json()
                const aiResponse = chatResult.message

                const aiMessage: ConversationMessage = {
                  id: `ai-${Date.now()}`,
                  role: "assistant",
                  content: aiResponse,
                  timestamp: new Date(),
                  audioUrl: undefined,
                }
                setConversation((prev) => [...prev, aiMessage])
                generateAISpeech(aiResponse, aiMessage.id)
              } else {
                console.error("Chat error: ", await chatResponse.text())
              }
            } catch (error) {
              console.error("Chat error:", error)
            } finally {
              setIsAIThinking(false)
              setIsProcessing(false)
            }
          } else {
            console.error("Transcription error: ", await response.text())
            const errorMessage: ConversationMessage = {
              id: `user-${Date.now()}`,
              role: "user",
              content: t.transcriptionFailed,
              timestamp: new Date(),
            }
            setConversation((prev) => [...prev, errorMessage])
            setIsProcessing(false)
          }
        } catch (error) {
          console.error("Transcription error:", error)
          const errorMessage: ConversationMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: t.errorOccurred,
            timestamp: new Date(),
          }
          setConversation((prev) => [...prev, errorMessage])
          setIsProcessing(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Initialize Web Speech API for live transcription and VAD
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language === "en" ? "en-US" : "vi-VN"

      recognition.onresult = (event) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setCurrentTranscript(interimTranscript || finalTranscript)

        // Reset silence timer on any new speech (interim or final)
        if (silenceTimerIdRef.current) {
          clearTimeout(silenceTimerIdRef.current)
        }
        silenceTimerIdRef.current = setTimeout(() => {
          console.log("Silence detected via Web Speech API, stopping recording.")
          stopRecording(true)
        }, SILENCE_DURATION_MS)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        if (isRecording) {
          stopRecording()
        }
      }

      recognition.onend = () => {
        if (isRecording) {
          console.log("Speech recognition ended unexpectedly, stopping recording.")
          stopRecording()
        }
      }

      speechRecognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
      setIsProcessing(false)
    }
  }, [conversation, topic, difficulty, language, t.speechApiNotSupported, isRecording, monitorSilence])

  const stopRecording = useCallback((autoStopped = false) => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    // Stop SpeechRecognition
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }

    // Clear silence timer
    if (silenceTimerIdRef.current) {
      clearTimeout(silenceTimerIdRef.current)
      silenceTimerIdRef.current = null
    }

    // Stop VAD monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsSpeakingDetected(false)

    setIsRecording(false)
    setCurrentTranscript("")

    // Keep the live transcript visible during processing
    setIsProcessing(true)
  }, [])

  const generateAISpeech = async (text: string, messageId: string) => {
    try {
      // Stop any currently playing audio first
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      }

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        // Track the current audio
        currentAudioRef.current = audio

        // Update the AI message with the audioUrl
        setConversation((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, audioUrl: audioUrl } : msg)))

        // Clean up when audio ends
        audio.onended = () => {
          currentAudioRef.current = null
        }

        audio.play()
      }
    } catch (error) {
      console.error("TTS error:", error)
    }
  }

  const playWarningBeep = () => {
    // Create a gentle beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
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

  // Effect to handle scroll events and detect if user scrolled up
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = chatContainer
      userScrolledUpRef.current = scrollHeight - scrollTop > clientHeight + 10
    }

    chatContainer.addEventListener("scroll", handleScroll)
    return () => chatContainer.removeEventListener("scroll", handleScroll)
  }, [])

  // Effect to auto-scroll when conversation changes
  useEffect(() => {
    if (chatContainerRef.current && !userScrolledUpRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      // Cleanup VAD resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (silenceTimerIdRef.current) {
        clearTimeout(silenceTimerIdRef.current)
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
    }
  }, [])

  const translateMessage = async (messageId: string, text: string) => {
    if (translationsData[messageId]) {
      setTranslations((prev) => ({
        ...prev,
        [messageId]: prev[messageId] === text ? "" : prev[messageId],
      }))
      return
    }

    setLoadingTranslations((prev) => ({ ...prev, [messageId]: true }))

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          targetLanguage: "vi",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTranslations((prev) => ({
          ...prev,
          [messageId]: result.translation,
        }))
      }
    } catch (error) {
      console.error("Translation error:", error)
    } finally {
      setLoadingTranslations((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  const translateAllAnalysis = async () => {
    if (analysisTranslations["all"]) {
      setAnalysisTranslations((prev) => ({
        ...prev,
        strengths: prev["all"] ? "" : prev["strengths"] || "",
        improvements: prev["all"] ? "" : prev["improvements"] || "",
        feedback: prev["all"] ? "" : prev["feedback"] || "",
        suggestions: prev["all"] ? "" : prev["suggestions"] || "",
        all: prev["all"] ? "" : "translated",
      }))
      return
    }

    setLoadingAnalysisTranslations((prev) => ({ ...prev, all: true }))

    try {
      const response = await fetch("/api/analyze-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation,
          topic,
          difficulty,
          timeLimit: actualTimeLimit,
          language: "vi",
        }),
      })

      if (response.ok) {
        const result = await response.json()

        setAnalysisTranslations((prev) => ({
          ...prev,
          strengths: result.strengths.join(". "),
          improvements: result.improvements.join(". "),
          feedback: result.feedback,
          suggestions: result.suggestions
            ? result.suggestions
                .map((s: any) => `${s.category}: "${s.original}" → "${s.alternative}" (${s.explanation})`)
                .join(" | ")
            : "",
          all: "translated",
        }))
      }
    } catch (error) {
      console.error("Vietnamese analysis error:", error)
    } finally {
      setLoadingAnalysisTranslations((prev) => ({ ...prev, all: false }))
    }
  }

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Grammar":
        return "bg-blue-900/20 border-blue-800/30 text-blue-300"
      case "Vocabulary":
        return "bg-green-900/20 border-green-800/30 text-green-300"
      case "Natural Expression":
        return "bg-purple-900/20 border-purple-800/30 text-purple-300"
      case "Pronunciation Guide":
        return "bg-orange-900/20 border-orange-800/30 text-orange-300"
      default:
        return "bg-gray-900/20 border-gray-800/30 text-gray-300"
    }
  }

  // Helper function to get component score color
  const getComponentScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  // Helper function to get expectation status
  const getExpectationStatus = (expectationScore: number, metExpectations?: boolean) => {
    if (expectationScore >= 8) {
      return {
        text: t.exceededExpectations,
        color: "text-emerald-400",
        icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      }
    } else if (expectationScore >= 6 || metExpectations) {
      return {
        text: t.metExpectations,
        color: "text-blue-400",
        icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
      }
    } else {
      return {
        text: t.belowExpectations,
        color: "text-orange-400",
        icon: <XCircle className="w-4 h-4 text-orange-400" />,
      }
    }
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 text-gray-300 hover:text-white font-bold text-xs tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToSetup}
            </Button>

            <div className="text-center flex-1 max-w-md">
              <h1 className="text-base font-bold">{t.practiceSession}</h1>
            </div>

            <div className="text-xs font-bold text-gray-300 text-right">
              <div>{t.timeRemaining}</div>
              <div className="text-emerald-400">{formatTime(timeRemaining)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-6xl relative z-10">
        {!isCallActive ? (
          /* Call Start Screen */
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-bold">{t.readyToStart}</h2>
              <p className="text-sm text-gray-400">{t.startDescription}</p>

              <div className="space-y-2 text-xs">
                <div className="text-xs text-gray-400 font-semibold">
                  <span className="text-gray-500">{language === "en" ? "Topic" : "Nội dung"}:</span>{" "}
                  <span className="text-emerald-400 font-bold">{extractTopicTitle(topic)}</span>
                </div>
                <div className="text-xs text-gray-400 font-semibold">
                  <span className="text-gray-500">{language === "en" ? "Level" : "Trình độ"}:</span>{" "}
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(difficulty)}`}>
                    {t.difficultyLevels[difficulty - 1]}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-semibold">
                  <span className="text-gray-500">{language === "en" ? "Duration" : "Thời gian"}:</span>{" "}
                  <span className="text-white font-bold">
                    {actualTimeLimit} {language === "en" ? "minutes" : "phút"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={startCall}
              size="lg"
              className="h-16 px-8 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full"
            >
              <Phone className="w-6 h-6 mr-3" />
              {t.startCall}
            </Button>
          </div>
        ) : (
          /* Active Call Interface */
          <div className="space-y-6">
            {/* Conversation Display */}
            <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm min-h-[400px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                  <Volume2 className="w-5 h-5 text-emerald-500" />
                  Live Conversation
                </CardTitle>
              </CardHeader>
              <CardContent ref={chatContainerRef} className="space-y-4 max-h-[350px] overflow-y-auto">
                {conversation.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <div className="text-xs font-bold mb-1 opacity-70">{message.role === "user" ? t.you : t.ai}</div>
                      <p className="text-xs font-medium leading-relaxed">{message.content}</p>

                      {/* Translation section */}
                      {translationsData[message.id] && (
                        <div className="mt-2 pt-2 border-t border-gray-500/30">
                          <p className="text-xs text-gray-300 italic leading-relaxed">{translationsData[message.id]}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-2">
                        {/* Audio playback button */}
                        {message.audioUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(message.audioUrl)
                              audio.play()
                            }}
                            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                            title={message.role === "user" ? "Play your recording" : "Play AI voice"}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{message.role === "user" ? "play" : "play AI"}</span>
                          </button>
                        )}

                        {/* Translate button */}
                        <button
                          onClick={() => translateMessage(message.id, message.content)}
                          disabled={loadingTranslations[message.id]}
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          {loadingTranslations[message.id] ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              <span>🌐</span>
                              <span>dịch</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Live transcription while recording */}
                {isRecording && currentTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] p-3 rounded-lg bg-emerald-600/50 border border-emerald-500">
                      <div className="text-xs font-bold mb-1 text-emerald-200">
                        {t.you} ({t.speaking})
                      </div>
                      <p className="text-xs font-medium text-white">{currentTranscript}</p>
                    </div>
                  </div>
                )}

                {/* General processing/AI thinking indicator */}
                {(isProcessing || isAIThinking) && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isProcessing && !isRecording ? t.processing : isAIThinking ? t.aiThinking : null}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Controls */}
            <div className="flex justify-center items-center gap-6">
              <Button
                onClick={isRecording ? () => stopRecording(false) : startRecording}
                disabled={isProcessing || isAIThinking}
                className={`w-32 h-16 rounded-full text-white font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  isRecording ? "bg-red-500 hover:bg-red-600 scale-105" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                {isRecording ? t.sendButton : t.speakButton}
              </Button>

              <Button
                onClick={() => endCall()}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
                {isRecording ? (
                  <>
                    <div
                      className={`w-3 h-3 rounded-full ${isSpeakingDetected ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`}
                    ></div>
                    {t.listening}
                  </>
                ) : isProcessing || isAIThinking ? (
                  t.processing
                ) : (
                  t.tapToSpeak
                )}
              </p>
            </div>
          </div>
        )}
        {/* Enhanced Analysis Results */}
        {isAnalyzing && !analysisResult ? (
          <div className="mt-8 flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            <p className="text-lg font-bold text-gray-300">{t.analyzing}</p>
          </div>
        ) : (
          analysisResult && (
            <div className="mt-8 space-y-4">
              <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-white">
                      {language === "en" ? "Comprehensive Practice Analysis" : "Phân Tích Luyện Tập Toàn Diện"}
                    </CardTitle>
                    <button
                      onClick={() => translateAllAnalysis()}
                      disabled={loadingAnalysisTranslations["all"]}
                      className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {loadingAnalysisTranslations["all"] ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>...</span>
                        </>
                      ) : (
                        <>
                          <span>🌐</span>
                          <span>dịch</span>
                        </>
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enhanced Scoring Display */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        {analysisResult.finalScore
                          ? `${analysisResult.finalScore}/100`
                          : `${analysisResult.expectationScore}/10`}
                      </div>
                      <div className="text-xs text-gray-400">{language === "en" ? "Final Score" : "Điểm Cuối"}</div>
                      {analysisResult.lengthBonus && (
                        <div className="text-xs text-blue-300 mt-1">
                          {language === "en"
                            ? `Length Bonus: ${analysisResult.lengthBonus.toFixed(2)}x`
                            : `Thưởng Độ Dài: ${analysisResult.lengthBonus.toFixed(2)}x`}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).icon}
                        <div
                          className={`text-2xl font-bold ${getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).color}`}
                        >
                          {analysisResult.expectationScore}/10
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).text}
                      </div>
                    </div>
                  </div>

                  {/* Component Scores Breakdown */}
                  {analysisResult.componentScores && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-purple-400">
                        {language === "en" ? "Component Breakdown" : "Phân Tích Chi Tiết"}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">{language === "en" ? "Fluency:" : "Lưu loát:"}</span>
                          <span
                            className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.fluency)}`}
                          >
                            {analysisResult.componentScores.fluency}/100
                          </span>
                        </div>
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">{language === "en" ? "Pronunciation:" : "Phát âm:"}</span>
                          <span
                            className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.pronunciation)}`}
                          >
                            {analysisResult.componentScores.pronunciation}/100
                          </span>
                        </div>
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">{language === "en" ? "Grammar:" : "Ngữ pháp:"}</span>
                          <span
                            className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.grammar)}`}
                          >
                            {analysisResult.componentScores.grammar}/100
                          </span>
                        </div>
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">{language === "en" ? "Vocabulary:" : "Từ vựng:"}</span>
                          <span
                            className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.vocabulary)}`}
                          >
                            {analysisResult.componentScores.vocabulary}/100
                          </span>
                        </div>
                        <div className="flex justify-start gap-2 col-span-2">
                          <span className="text-gray-300">
                            {language === "en" ? "Content Richness:" : "Nội dung phong phú:"}
                          </span>
                          <span
                            className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.contentRichness)}`}
                          >
                            {analysisResult.componentScores.contentRichness}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Speaking Metrics */}
                  {analysisResult.speakingMetrics && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-cyan-400">
                        {language === "en" ? "Speaking Metrics" : "Thống Kê Nói"}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">{language === "en" ? "Words Spoken:" : "Số từ nói:"}</span>
                          <span className="text-white font-bold">{analysisResult.speakingMetrics.totalWords}</span>
                        </div>
                        <div className="flex justify-start gap-2">
                          <span className="text-gray-300">
                            {language === "en" ? "Speaking Time:" : "Thời gian nói:"}
                          </span>
                          <span className="text-white font-bold">
                            {analysisResult.speakingMetrics.estimatedSeconds}s
                          </span>
                        </div>
                        <div className="flex justify-start gap-2 col-span-2">
                          <span className="text-gray-300">{language === "en" ? "Speaking Ratio:" : "Tỷ lệ nói:"}</span>
                          <span
                            className={`font-bold ${analysisResult.speakingMetrics.speakingRatio >= 0.8 ? "text-emerald-400" : analysisResult.speakingMetrics.speakingRatio >= 0.5 ? "text-yellow-400" : "text-orange-400"}`}
                          >
                            {(analysisResult.speakingMetrics.speakingRatio * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400 mb-2">
                        {language === "en" ? "Strengths" : "Điểm Mạnh"}
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {analysisResult.strengths.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                      {analysisTranslations["strengths"] && (
                        <div className="mt-2 pt-2 border-t border-gray-500/30">
                          <p className="text-xs text-gray-300 italic leading-relaxed">
                            {analysisTranslations["strengths"]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-orange-400 mb-2">
                        {language === "en" ? "Areas to Improve" : "Cần Cải Thiện"}
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {analysisResult.improvements.map((improvement, index) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                      {analysisTranslations["improvements"] && (
                        <div className="mt-2 pt-2 border-t border-gray-500/30">
                          <p className="text-xs text-gray-300 italic leading-relaxed">
                            {analysisTranslations["improvements"]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-blue-400 mb-2">
                        {language === "en" ? "Detailed Feedback" : "Nhận Xét Chi Tiết"}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{analysisResult.feedback}</p>
                      {analysisTranslations["feedback"] && (
                        <div className="mt-2 pt-2 border-t border-gray-500/30">
                          <p className="text-xs text-gray-300 italic leading-relaxed">
                            {analysisTranslations["feedback"]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Suggestions Section */}
                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-bold text-sm text-purple-400 mb-3">
                          {language === "en" ? "Improvement Suggestions" : "Gợi Ý Cải Thiện"}
                        </h4>
                        <div className="space-y-3">
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold border ${getCategoryColor(
                                    suggestion.category,
                                  )}`}
                                >
                                  {suggestion.category}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                              </div>

                              <div className="space-y-1">
                                <div className="text-xs">
                                  <span className="text-red-400 font-semibold">
                                    {language === "en" ? "Original:" : "Gốc:"}
                                  </span>
                                  <span className="text-gray-300 ml-2">"{suggestion.original}"</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-emerald-400 font-semibold">
                                    {language === "en" ? "Better:" : "Tốt hơn:"}
                                  </span>
                                  <span className="text-white ml-2 font-medium">"{suggestion.alternative}"</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-blue-400 font-semibold">
                                    {language === "en" ? "Why:" : "Tại sao:"}
                                  </span>
                                  <span className="text-gray-300 ml-2">{suggestion.explanation}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {analysisTranslations["suggestions"] && (
                          <div className="mt-3 pt-3 border-t border-gray-500/30">
                            <p className="text-xs text-gray-300 italic leading-relaxed">
                              ({analysisTranslations["suggestions"]})
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => setShowHistoryModal(true)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                >
                  {t.viewHistory}
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Conversation History Modal */}
      <ConversationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        conversation={conversation}
        topic={topic}
        difficulty={difficulty}
        timeLimit={actualTimeLimit}
        language={language}
      />

      <style jsx>{`
        @keyframes fly1 {
          0% {
            transform: translate(-100px, 20vh) rotate(0deg);
          }
          25% {
            transform: translate(25vw, 10vh) rotate(90deg);
          }
          50% {
            transform: translate(50vw, 30vh) rotate(180deg);
          }
          75% {
            transform: translate(75vw, 15vh) rotate(270deg);
          }
          100% {
            transform: translate(calc(100vw + 100px), 25vh) rotate(360deg);
          }
        }

        @keyframes fly2 {
          0% {
            transform: translate(-100px, 60vh) rotate(0deg);
          }
          30% {
            transform: translate(30vw, 70vh) rotate(120deg);
          }
          60% {
            transform: translate(60vw, 40vh) rotate(240deg);
          }
          100% {
            transform: translate(calc(100vw + 100px), 50vh) rotate(360deg);
          }
        }

        @keyframes fly3 {
          0% {
            transform: translate(-100px, 80vh) rotate(0deg);
          }
          20% {
            transform: translate(20vw, 85vh) rotate(72deg);
          }
          40% {
            transform: translate(40vw, 60vh) rotate(144deg);
          }
          60% {
            transform: translate(60vw, 75vh) rotate(216deg);
          }
          80% {
            transform: translate(80vw, 65vh) rotate(288deg);
          }
          100% {
            transform: translate(calc(100vw + 100px), 70vh) rotate(360deg);
          }
        }

        @keyframes float1 {
          0%,
          100% {
            transform: translate(10vw, 30vh) translateY(0px);
          }
          50% {
            transform: translate(15vw, 35vh) translateY(-20px);
          }
        }

        @keyframes float2 {
          0%,
          100% {
            transform: translate(80vw, 60vh) translateY(0px);
          }
          50% {
            transform: translate(85vw, 55vh) translateY(-15px);
          }
        }

        @keyframes float3 {
          0%,
          100% {
            transform: translate(60vw, 80vh) translateY(0px);
          }
          50% {
            transform: translate(65vw, 75vh) translateY(-25px);
          }
        }
      `}</style>
    </div>
  )
}
