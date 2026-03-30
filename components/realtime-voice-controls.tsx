"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import type { RealtimeConnectionState } from "@/types/realtime"
import { OwlMascot, type OwlState } from "@/components/owl-mascot"

interface RealtimeVoiceControlsProps {
  connectionState: RealtimeConnectionState
  isUserSpeaking: boolean
  isAISpeaking: boolean
  isMuted: boolean
  onConnect: () => void
  onDisconnect: () => void
  onMute: () => void
  onUnmute: () => void
  onInterrupt: () => void
  language?: "en" | "vi"
}

const translations = {
  en: {
    connecting: "Connecting...",
    listening: "Listening...",
    youAreSpeaking: "I hear you!",
    aiSpeaking: "Mata is talking...",
    tapToStart: "Tap to talk!",
    muted: "Mic off",
    endCall: "End",
  },
  vi: {
    connecting: "Dang ket noi...",
    listening: "Dang nghe...",
    youAreSpeaking: "Toi nghe thay!",
    aiSpeaking: "Mata dang noi...",
    tapToStart: "Nhan de noi!",
    muted: "Tat mic",
    endCall: "Ket thuc",
  },
}

export function RealtimeVoiceControls({
  connectionState,
  isUserSpeaking,
  isAISpeaking,
  isMuted,
  onConnect,
  onDisconnect,
  onMute,
  onUnmute,
  onInterrupt,
  language = "en",
}: RealtimeVoiceControlsProps) {
  const t = translations[language]
  const isConnected = connectionState === "connected"
  const isConnecting = connectionState === "connecting"

  const getOwlState = (): OwlState => {
    if (isConnecting) return "thinking"
    if (!isConnected) return "waving"
    if (isAISpeaking) return "speaking"
    if (isUserSpeaking) return "listening"
    return "idle"
  }

  const getStatusLabel = () => {
    if (isConnecting) return t.connecting
    if (!isConnected) return t.tapToStart
    if (isAISpeaking) return t.aiSpeaking
    if (isUserSpeaking) return t.youAreSpeaking
    return t.listening
  }

  const getStatusColor = () => {
    if (isUserSpeaking) return "text-success"
    if (isAISpeaking) return "text-secondary-foreground"
    if (isConnecting) return "text-muted-foreground"
    return "text-muted-foreground"
  }

  const getDotColor = () => {
    if (!isConnected) return "bg-muted-foreground/40"
    if (isUserSpeaking) return "bg-success animate-pulse"
    if (isAISpeaking) return "bg-violet-400 animate-pulse"
    return "bg-success/60"
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">

      {/* Owl */}
      <OwlMascot
        state={getOwlState()}
        size="md"
        showSpeechBubble={isAISpeaking}
        speechText={isAISpeaking ? "..." : ""}
      />

      {/* Controls row */}
      <div className="flex items-center justify-center gap-4">

        {/* Mute toggle — only when connected */}
        {isConnected && (
          <button
            onClick={isMuted ? onUnmute : onMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 border-2 ${
              isMuted
                ? "bg-rose-100 border-rose-300 text-rose-500"
                : "bg-sky-100 border-sky-300 text-sky-500"
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Main big button */}
        {!isConnected ? (
          <button
            onClick={isConnecting ? undefined : onConnect}
            disabled={isConnecting}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-all active:scale-95 font-bold text-white ${
              isConnecting
                ? "bg-violet-300 border-violet-200 cursor-wait"
                : "bg-gradient-to-b from-sky-400 to-sky-500 border-sky-300 hover:scale-105"
            }`}
            aria-label="Start talking"
          >
            {isConnecting ? (
              <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </button>
        ) : (
          <button
            onClick={isAISpeaking ? onInterrupt : undefined}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-all ${
              isUserSpeaking
                ? "bg-gradient-to-b from-emerald-400 to-emerald-500 border-emerald-300 ring-4 ring-emerald-300/50 animate-glow-pulse"
                : isAISpeaking
                  ? "bg-gradient-to-b from-violet-400 to-violet-500 border-violet-300 animate-bounce-gentle cursor-pointer hover:scale-105 active:scale-95"
                  : "bg-gradient-to-b from-emerald-400 to-emerald-500 border-emerald-300"
            }`}
            aria-label={isAISpeaking ? "Interrupt" : "Microphone active"}
          >
            <Mic className="w-9 h-9 text-white" />
          </button>
        )}

        {/* End call — only when connected */}
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-rose-100 border-2 border-rose-300 text-rose-500 transition-all active:scale-95 hover:bg-rose-200"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status label */}
      <p className={`text-sm font-bold flex items-center gap-1.5 ${getStatusColor()}`}>
        <span className={`inline-block w-2 h-2 rounded-full ${getDotColor()}`} />
        {getStatusLabel()}
        {isMuted && isConnected && (
          <span className="ml-1 text-rose-400">({t.muted})</span>
        )}
      </p>
    </div>
  )
}
