"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConversationHistoryModal } from "@/components/conversation-history-modal"
import {
  getConversationById,
  generateConversationId,
  base64ToBlobUrl,
  type ConversationEntry,
} from "@/lib/conversation-storage"
import { UnifiedStorageService } from "@/lib/unified-storage-service"
import { PracticeHeader } from "@/components/practice-header"
import { CallStartScreen } from "@/components/call-start-screen"
import { ConversationDisplay, type ConversationMessage } from "@/components/conversation-display"
import { VoiceControls } from "@/components/voice-controls"
import { AnalysisResults } from "@/components/analysis-results"
import { InterviewPrepModal, type InterviewData } from "@/components/interview-prep-modal"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useAudioRecording } from "@/hooks/use-audio-recording"
import { AiLessonBuilderModal } from "@/components/ai-lesson-builder-modal"
import { CustomCallModal, type CustomCallConfig } from "@/components/custom-call-modal"
import { PracticePageSkeleton } from "@/components/page-skeleton"
import { usePrefetch } from "@/hooks/use-prefetch"

const PracticePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false) // Changed to false for better UX

  // Get settings from URL params
  const topic = searchParams.get("topic") || ""
  const timeLimit = Number.parseInt(searchParams.get("timeLimit") || "5") // Changed default from "10" to "5"
  const difficulty = Number.parseInt(searchParams.get("difficulty") || "3")
  const voice = searchParams.get("voice") || "alloy"
  const language = (searchParams.get("language") || "en") as "en" | "vi"
  const initialMode = (searchParams.get("mode") || "casual-chat") as "casual-chat" | "speaking-practice" | "interview" // Changed default from "speaking-practice" to "casual-chat"

  const [mode, setMode] = useState<"casual-chat" | "speaking-practice" | "interview">(initialMode)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const actualTimeLimit = timeLimit
  const [timeRemaining, setTimeRemaining] = useState(actualTimeLimit * 60)
  const [isCallActive, setIsCallActive] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isSpeakingDetected, setIsSpeakingDetected] = useState(false)
  const [showInterviewPrep, setShowInterviewPrep] = useState(false)
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [showLessonBuilder, setShowLessonBuilder] = useState(false)
  const [showCustomCallModal, setShowCustomCallModal] = useState(false)
  const [customCallConfig, setCustomCallConfig] = useState<CustomCallConfig | null>(null)

  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const userScrolledUpRef = useRef(false)
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const SILENCE_THRESHOLD = 20

  const [conversationId, setConversationId] = useState<string | null>(null)

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [translationsData, setTranslations] = useState<Record<string, string>>({})
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({})
  const [analysisTranslations, setAnalysisTranslations] = useState<Record<string, string>>({})
  const [loadingAnalysisTranslations, setLoadingAnalysisTranslations] = useState<Record<string, boolean>>({})

  // Use custom hooks at the top level of the component
  const { isRecording, startRecording, stopRecording, cleanup: audioCleanup } = useAudioRecording()
  const { startSpeechRecognition, stopSpeechRecognition } = useSpeechRecognition()

  // Prefetch common endpoints based on mode
  usePrefetch(
    [
      "/api/chat",
      "/api/speech-to-text",
      "/api/text-to-speech",
      "/api/translate",
    ].filter(Boolean) as string[],
    {
      enabled: true,
      delay: 200, // Reduced delay for better UX
    },
  )

  // Effect to load conversation if ID is provided in URL
  const conversationIdParam = searchParams.get("conversationId")
  useEffect(() => {
    // Load immediately without artificial delay for better UX
    if (conversationIdParam) {
      const loaded = getConversationById(conversationIdParam)
      if (loaded) {
        console.log("Loading conversation:", loaded)
        setConversationId(loaded.id)

        // Convert stored messages back to ConversationMessage format
        const convertedMessages: ConversationMessage[] = loaded.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          audioUrl: msg.audioData ? base64ToBlobUrl(msg.audioData) : undefined,
        }))

        setConversation(convertedMessages)
        setTimeRemaining(loaded.timeRemaining || loaded.config.timeLimit * 60)
        setMode(loaded.config.mode)
        return
      }
    }
    setConversationId(generateConversationId())
  }, [conversationIdParam])

  // Handle mode changes
  const handleModeChange = (newMode: "casual-chat" | "speaking-practice" | "interview") => {
    if (isCallActive) return // Don't allow mode changes during active call

    setMode(newMode)

    // If switching to interview mode, show prep modal
    if (newMode === "interview" && !interviewData) {
      setShowInterviewPrep(true)
    }
  }

  // Handle interview preparation completion
  const handleInterviewPrepComplete = (data: InterviewData) => {
    setInterviewData(data)
    setShowInterviewPrep(false)
  }

  // Handle opening custom call modal
  const handleOpenCustomCallModal = (
    config: CustomCallConfig,
    promptData?: { rawTopic: string; conversationMode: string; voice: string; timeLimit: string },
  ) => {
    setCustomCallConfig(config)
    setShowCustomCallModal(true)
  }

  // Handle opening lesson builder modal
  const handleOpenLessonBuilder = () => {
    setShowLessonBuilder(true)
  }

  // Timer countdown
  useEffect(() => {
    if (isCallActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === 10 && !hasPlayedWarning) {
            setHasPlayedWarning(true)
            playWarningBeep()
          }

          if (prev <= 1) {
            endCall(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isCallActive, timeRemaining, hasPlayedWarning])

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

    setIsSpeakingDetected(averageVolume > SILENCE_THRESHOLD)
    animationFrameRef.current = requestAnimationFrame(monitorSilence)
  }, [isRecording, SILENCE_THRESHOLD])

  const startCall = async (config?: CustomCallConfig) => {
    try {
      setIsCallActive(true)
      setHasPlayedWarning(false)

      // If a config is provided, use it to set the initial state
      if (config) {
        setMode(config.conversationMode)
        // Update other settings if needed from config
      }

      if (conversation.length > 0 && conversationId) {
        const lastAIMessage = conversation.findLast((msg) => msg.role === "assistant" && msg.audioUrl)
        if (lastAIMessage && currentAudioRef.current) {
          currentAudioRef.current.src = lastAIMessage.audioUrl!
          currentAudioRef.current.play()
        }
        return
      }

      setIsAIThinking(true)
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Hi! I want to practice ${config?.topic || topic}. Can you start our conversation?`,
              },
            ],
            topic: config?.topic || topic,
            difficulty: config?.difficulty || difficulty,
            language: config?.language || language,
            mode: config?.conversationMode || mode,
            interviewContext: interviewData?.interviewContext,
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
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }

    stopSpeechRecognition()
    audioCleanup() // Use the cleanup from useAudioRecording

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsSpeakingDetected(false)

    // Save conversation to localStorage when call ends
    if (conversation.length > 0 && conversationId) {
      const actualTimeLimitMinutes = timeLimit // Use timeLimit directly instead of array lookup
      const now = Date.now()
      const sessionDuration = (actualTimeLimitMinutes * 60 - timeRemaining) / 60 // Duration in minutes

      const conversationEntry: ConversationEntry = {
        id: conversationId,
        timestamp: new Date().toISOString(),
        messages: conversation.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.getTime(),
          audioData: msg.audioUrl || undefined, // Store the blob URL, will be converted to base64 in saveConversation
        })),
        config: {
          topic: topic,
          difficulty: difficulty,
          voice: voice,
          timeLimit: actualTimeLimitMinutes, // Use actualTimeLimitMinutes
          language: language,
          mode: mode,
        },
        callEnded: true,
        timeRemaining: timeRemaining,
        startTime: now - sessionDuration * 60 * 1000,
        endTime: now,
        duration: sessionDuration,
      }

      await UnifiedStorageService.saveConversation(conversationEntry)
      console.log("Conversation saved on call end:", conversationEntry)
    }

    setIsCallActive(false)
    setCurrentTranscript("")
    setIsProcessing(false)
    setIsAIThinking(false)

    // Trigger analysis for speaking-practice and interview modes only
    if (conversation.length > 0 && mode !== "casual-chat") {
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
            mode, // Pass the current mode to the analysis API
            interviewContext: interviewData?.interviewContext, // Pass interview context if available
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setAnalysisResult(result)
        } else {
          console.error("Analysis API error:", response.status, response.statusText)
          // Set a fallback analysis result
          setAnalysisResult({
            mode: mode,
            message: "Analysis temporarily unavailable. Your conversation was saved successfully.",
            feedback: "Great job on completing your practice session!",
          })
        }
      } catch (error) {
        console.error("Analysis error:", error)
        // Set a fallback analysis result
        setAnalysisResult({
          mode: mode,
          message: "Analysis temporarily unavailable. Your conversation was saved successfully.",
          feedback: "Great job on completing your practice session!",
        })
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  // Define handleStopRecording before handleStartRecording
  const handleStopRecording = useCallback(() => {
    stopRecording()
    stopSpeechRecognition()

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsSpeakingDetected(false)
    setCurrentTranscript("")
    setIsProcessing(true)
  }, [stopRecording, stopSpeechRecognition])

  const handleStartRecording = useCallback(async () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }

    try {
      // Setup Web Audio API for volume monitoring
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)

      source.connect(analyserRef.current)
      monitorSilence()

      await startRecording(async (audioBlob, audioUrl) => {
        try {
          console.log("Processing audio blob:", {
            size: audioBlob.size,
            type: audioBlob.type,
            hasAudioUrl: !!audioUrl,
          })

          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")
          formData.append("language", language)

          console.log("Sending request to speech-to-text API...")
          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          console.log("Speech-to-text API response status:", response.status)

          if (response.ok) {
            const result = await response.json()
            const transcribedText = result.text
            console.log("Transcribed text received:", transcribedText)

            // Only proceed if we have actual transcribed text
            if (!transcribedText || transcribedText.trim().length === 0) {
              console.log("No transcribed text received, skipping...")
              setIsProcessing(false)
              return
            }

            const userMessage: ConversationMessage = {
              id: `user-${Date.now()}`,
              role: "user",
              content: transcribedText,
              timestamp: new Date(),
              audioUrl: audioUrl,
            }
            setConversation((prev) => [...prev, userMessage])

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
                  mode,
                  interviewContext: interviewData?.interviewContext,
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
                const errorText = await chatResponse.text()
                console.error("Chat API error response:", chatResponse.status, errorText)
              }
            } catch (error) {
              console.error("Chat error:", error)
            } finally {
              setIsAIThinking(false)
              setIsProcessing(false)
            }
          } else {
            const errorText = await response.text()
            console.error("Speech-to-text API error response:", response.status, errorText)

            // Show user-friendly error message
            const errorMessage =
              response.status === 400
                ? "Audio format not supported. Please try again."
                : "Speech recognition temporarily unavailable. Please try again."

            console.error("Speech-to-text error:", errorMessage)
            setIsProcessing(false)
          }
        } catch (error) {
          console.error("Transcription fetch error:", error)
          setIsProcessing(false)
        }
      })

      startSpeechRecognition(
        language,
        (transcript) => setCurrentTranscript(transcript),
        () => handleStopRecording(),
        (error) => {
          console.error("Speech recognition error:", error)
          if (isRecording) {
            handleStopRecording()
          }
        },
      )
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsProcessing(false)
    }
  }, [
    conversation,
    topic,
    difficulty,
    language,
    monitorSilence,
    mode,
    interviewData,
    startRecording,
    startSpeechRecognition,
    handleStopRecording,
    isRecording,
  ])

  const generateAISpeech = async (text: string, messageId: string) => {
    console.log("Attempting to generate AI speech for messageId:", messageId, "Text:", text)
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
        console.log("Paused and reset previous audio.")
      }

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          voice, 
          conversationId: conversationId,
          messageId: messageId 
        }),
      })

      console.log("Text-to-speech API response status:", response.status)

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          // Cloud storage response - contains signed URL
          const result = await response.json()
          const audio = new Audio(result.audioUrl)
          console.log("Cloud audio URL received:", result.audioUrl)

          currentAudioRef.current = audio
          setConversation((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, audioUrl: result.audioUrl } : msg)))
          console.log("Attempting to play cloud audio for messageId:", messageId)
          audio.play()
        } else {
          // Direct audio response - create blob URL
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          console.log("Audio blob received, URL created:", audioUrl)

          currentAudioRef.current = audio
          setConversation((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, audioUrl: audioUrl } : msg)))
          console.log("Attempting to play audio for messageId:", messageId)
          audio.play()
        }
      }
    } catch (error) {
      console.error("TTS error during generation or playback:", error)
    }
  }

  const playWarningBeep = () => {
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
          mode, // Pass the current mode to the analysis API for translation context
          interviewContext: interviewData?.interviewContext,
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
                .map((s: any, index: number) => ({
                  index,
                  original: s.original,
                  alternative: s.alternative,
                  explanation: s.explanation,
                  category: s.category
                }))
            : [],
          all: "translated",
        }))
      }
    } catch (error) {
      console.error("Vietnamese analysis error:", error)
    } finally {
      setLoadingAnalysisTranslations((prev) => ({ ...prev, all: false }))
    }
  }

  // Combined cleanup for all audio/speech resources
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      }
      audioCleanup() // Call cleanup from useAudioRecording
      stopSpeechRecognition() // Call cleanup from useSpeechRecognition

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioCleanup, stopSpeechRecognition])

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

  // Check if interview mode requires preparation
  const needsInterviewPrep = mode === "interview" && !interviewData

  // Only show skeleton if actually loading
  if (isLoading) {
    return <PracticePageSkeleton />
  }

  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden">
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

      <PracticeHeader
        timeRemaining={timeRemaining}
        language={language}
        mode={mode}
        onModeChange={handleModeChange}
        isCallActive={isCallActive}
        onOpenLessonBuilder={handleOpenLessonBuilder}
        onOpenCustomCallModal={handleOpenCustomCallModal}
        onOpenInterviewPrepModal={() => setShowInterviewPrep(true)}
      />

      <div className="container mx-auto px-6 py-6 max-w-6xl relative z-10">
        {!isCallActive ? (
          <CallStartScreen
            topic={topic}
            difficulty={difficulty}
            actualTimeLimit={actualTimeLimit}
            language={language}
            onStartCall={needsInterviewPrep ? () => setShowInterviewPrep(true) : startCall}
            mode={mode}
            interviewData={interviewData}
          />
        ) : (
          <div className="space-y-6">
            <ConversationDisplay
              ref={chatContainerRef}
              conversation={conversation}
              currentTranscript={currentTranscript}
              isRecording={isRecording}
              isProcessing={isProcessing}
              isAIThinking={isAIThinking}
              language={language}
              translationsData={translationsData}
              loadingTranslations={loadingTranslations}
              onTranslateMessage={translateMessage}
            />

            <VoiceControls
              isRecording={isRecording}
              isProcessing={isProcessing}
              isAIThinking={isAIThinking}
              isSpeakingDetected={isSpeakingDetected}
              language={language}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onEndCall={() => endCall()}
            />
          </div>
        )}

        {/* Show analysis results if analyzing or results are available */}
        {(isAnalyzing || analysisResult) && (
          <AnalysisResults
            isAnalyzing={isAnalyzing}
            analysisResult={analysisResult}
            language={language}
            analysisTranslations={analysisTranslations}
            loadingAnalysisTranslations={loadingAnalysisTranslations}
            onTranslateAllAnalysis={translateAllAnalysis}
            onViewHistory={() => setShowHistoryModal(true)}
          />
        )}
      </div>

      <ConversationHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        conversation={conversation}
        language={language}
        translateMessage={translateMessage}
        translationsData={translationsData}
        loadingTranslations={loadingTranslations}
      />

      <InterviewPrepModal
        isOpen={showInterviewPrep}
        onClose={() => setShowInterviewPrep(false)}
        onPrepComplete={handleInterviewPrepComplete}
        language={language}
      />

      <AiLessonBuilderModal
        isOpen={showLessonBuilder}
        onClose={() => setShowLessonBuilder(false)}
        onOpenCustomModal={handleOpenCustomCallModal}
        language={language}
      />

      <CustomCallModal
        isOpen={showCustomCallModal}
        onClose={() => setShowCustomCallModal(false)}
        onStartCall={startCall}
        language={language}
        initialConfig={customCallConfig}
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

export default PracticePage
