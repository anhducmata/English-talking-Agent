"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, Wifi, WifiOff } from "lucide-react"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface VoiceControlsProps {
  status: ConnectionStatus
  isMuted: boolean
  isAISpeaking: boolean
  language: "en" | "vi"
  onToggleMute: () => void
  onEndCall: () => void
}

export function VoiceControls({
  status,
  isMuted,
  isAISpeaking,
  language,
  onToggleMute,
  onEndCall,
}: VoiceControlsProps) {
  const isConnected = status === "connected"
  const isConnecting = status === "connecting"

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <div className="flex justify-center items-center gap-6">
        <Button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`w-32 h-16 rounded-full text-white font-bold text-base transition-all flex items-center justify-center gap-2 ${
            isMuted
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-600 hover:bg-emerald-700 scale-105"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </Button>

        <Button
          onClick={onEndCall}
          disabled={isConnecting}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
          {isConnecting ? (
            <>
              <Wifi className="w-3 h-3 animate-pulse text-yellow-400" />
              Connecting...
            </>
          ) : isConnected ? (
            isMuted ? (
              <>
                <MicOff className="w-3 h-3 text-red-400" />
                Microphone muted
              </>
            ) : isAISpeaking ? (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                AI is speaking...
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                Listening...
              </>
            )
          ) : status === "error" ? (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              Connection error
            </>
          ) : (
            "Disconnected"
          )}
        </p>
      </div>
    </div>
  )
}
