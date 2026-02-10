"use client"

import { useRef, useCallback, useState, useEffect } from "react"

export interface RealtimeMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface RealtimeConfig {
  topic: string
  difficulty: number
  language: "en" | "vi"
  mode: "casual-chat" | "speaking-practice" | "interview"
  voice: string
  interviewContext?: string
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface UseRealtimeVoiceReturn {
  status: ConnectionStatus
  isMuted: boolean
  isAISpeaking: boolean
  messages: RealtimeMessage[]
  currentUserTranscript: string
  currentAITranscript: string
  connect: (config: RealtimeConfig) => Promise<void>
  disconnect: () => void
  toggleMute: () => void
  sendTextMessage: (text: string) => void
}

export function useRealtimeVoice(): UseRealtimeVoiceReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [isMuted, setIsMuted] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [currentUserTranscript, setCurrentUserTranscript] = useState("")
  const [currentAITranscript, setCurrentAITranscript] = useState("")

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const currentResponseIdRef = useRef<string | null>(null)
  const currentItemIdRef = useRef<string | null>(null)
  const pendingAITextRef = useRef<string>("")
  const pendingUserTextRef = useRef<string>("")

  const disconnectFn = useCallback(() => {
    if (dcRef.current) {
      try { dcRef.current.close() } catch (e) { /* ignore */ }
      dcRef.current = null
    }
    if (pcRef.current) {
      try { pcRef.current.close() } catch (e) { /* ignore */ }
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.srcObject = null
      audioElementRef.current = null
    }
    setStatus("disconnected")
    setIsMuted(false)
    setIsAISpeaking(false)
    setCurrentUserTranscript("")
    setCurrentAITranscript("")
    currentResponseIdRef.current = null
    currentItemIdRef.current = null
    pendingAITextRef.current = ""
    pendingUserTextRef.current = ""
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFn()
    }
  }, [disconnectFn])

  const handleServerEvent = useCallback((event: Record<string, unknown>) => {
    const eventType = event.type as string

    switch (eventType) {
      // --- AI response lifecycle ---
      case "response.created": {
        const resp = event.response as Record<string, unknown> | undefined
        currentResponseIdRef.current = (resp?.id as string) || null
        pendingAITextRef.current = ""
        setIsAISpeaking(true)
        break
      }

      case "response.output_item.added": {
        const item = event.item as Record<string, unknown> | undefined
        if (item?.role === "assistant") {
          currentItemIdRef.current = item.id as string
        }
        break
      }

      case "response.audio_transcript.delta": {
        pendingAITextRef.current += (event.delta as string) || ""
        setCurrentAITranscript(pendingAITextRef.current)
        break
      }

      case "response.audio_transcript.done": {
        setCurrentAITranscript("")
        if (pendingAITextRef.current.trim()) {
          const aiMsg: RealtimeMessage = {
            id: "ai-" + Date.now() + "-" + Math.random().toString(36).slice(2),
            role: "assistant",
            content: pendingAITextRef.current.trim(),
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMsg])
        }
        pendingAITextRef.current = ""
        break
      }

      case "response.done": {
        setIsAISpeaking(false)
        currentResponseIdRef.current = null
        currentItemIdRef.current = null
        break
      }

      // --- User speech transcription ---
      case "conversation.item.input_audio_transcription.completed": {
        setCurrentUserTranscript("")
        const transcript = event.transcript as string | undefined
        if (transcript?.trim()) {
          const userMsg: RealtimeMessage = {
            id: "user-" + Date.now() + "-" + Math.random().toString(36).slice(2),
            role: "user",
            content: transcript.trim(),
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMsg])
        }
        pendingUserTextRef.current = ""
        break
      }

      case "input_audio_buffer.speech_started": {
        setCurrentUserTranscript("...")
        break
      }

      case "input_audio_buffer.speech_stopped": {
        setCurrentUserTranscript("")
        break
      }

      // --- Error handling ---
      case "error": {
        console.error("Realtime API error:", event.error)
        break
      }

      default:
        break
    }
  }, [])

  const connect = useCallback(
    async (config: RealtimeConfig) => {
      try {
        setStatus("connecting")
        setMessages([])

        // Step 1: Get ephemeral token from our backend
        const tokenResponse = await fetch("/api/realtime-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: config.topic,
            difficulty: config.difficulty,
            language: config.language,
            mode: config.mode,
            voice: config.voice,
            interviewContext: config.interviewContext,
          }),
        })

        if (!tokenResponse.ok) {
          throw new Error("Failed to get realtime session token")
        }

        const tokenData = await tokenResponse.json()
        const clientSecret = tokenData.clientSecret as string

        // Step 2: Create WebRTC peer connection
        const pc = new RTCPeerConnection()
        pcRef.current = pc

        // Set up remote audio playback
        const audioEl = document.createElement("audio")
        audioEl.autoplay = true
        audioElementRef.current = audioEl

        pc.ontrack = (e) => {
          audioEl.srcObject = e.streams[0]
        }

        // Add local audio track (microphone)
        const ms = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        localStreamRef.current = ms
        pc.addTrack(ms.getTracks()[0])

        // Set up data channel for events
        const dc = pc.createDataChannel("oai-events")
        dcRef.current = dc

        dc.addEventListener("open", () => {
          setStatus("connected")

          // Send initial response.create to trigger the AI greeting
          const createResponseEvent = {
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
              instructions: "Start the conversation. Greet the user warmly and ask an engaging question about " + config.topic + " to get the conversation started. Keep it short (1-2 sentences).",
            },
          }
          dc.send(JSON.stringify(createResponseEvent))
        })

        dc.addEventListener("message", (e) => {
          const parsed = JSON.parse(e.data) as Record<string, unknown>
          handleServerEvent(parsed)
        })

        dc.addEventListener("close", () => {
          setStatus("disconnected")
        })

        dc.addEventListener("error", () => {
          setStatus("error")
        })

        // Create and send SDP offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sdpResponse = await fetch(
          "https://api.openai.com/v1/realtime/calls",
          {
            method: "POST",
            body: offer.sdp,
            headers: {
              Authorization: "Bearer " + clientSecret,
              "Content-Type": "application/sdp",
            },
          },
        )

        if (!sdpResponse.ok) {
          throw new Error("Failed to establish WebRTC connection")
        }

        const answerSdp = await sdpResponse.text()
        await pc.setRemoteDescription({
          type: "answer",
          sdp: answerSdp,
        })
      } catch (error) {
        console.error("Realtime connection error:", error)
        setStatus("error")
        disconnectFn()
      }
    },
    [disconnectFn, handleServerEvent],
  )

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }, [])

  const sendTextMessage = useCallback((text: string) => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      // Add user message to conversation
      const conversationEvent = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: text,
            },
          ],
        },
      }
      dcRef.current.send(JSON.stringify(conversationEvent))

      // Request a response
      const responseEvent = {
        type: "response.create",
      }
      dcRef.current.send(JSON.stringify(responseEvent))

      // Add to local messages
      const userMsg: RealtimeMessage = {
        id: "user-" + Date.now() + "-" + Math.random().toString(36).slice(2),
        role: "user",
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
    }
  }, [])

  return {
    status,
    isMuted,
    isAISpeaking,
    messages,
    currentUserTranscript,
    currentAITranscript,
    connect,
    disconnect: disconnectFn,
    toggleMute,
    sendTextMessage,
  }
}
