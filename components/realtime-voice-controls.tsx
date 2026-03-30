"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, Volume2, Hand } from "lucide-react"
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
    connecting: "Connecting to Ollie...",
    connected: "Connected",
    disconnected: "Talk to Ollie!",
    error: "Oops! Try again",
    speaking: "I hear you!",
    listening: "Listening...",
    aiSpeaking: "Ollie is talking...",
    tapToInterrupt: "Tap to ask!",
    muted: "Microphone off",
    unmuted: "Microphone on",
    endCall: "Say Bye",
  },
  vi: {
    connecting: "Dang ket noi voi Ollie...",
    connected: "Da ket noi",
    disconnected: "Noi chuyen voi Ollie!",
    error: "Oi! Thu lai nhe",
    speaking: "Toi nghe thay ban!",
    listening: "Dang nghe...",
    aiSpeaking: "Ollie dang noi...",
    tapToInterrupt: "Nhan de hoi!",
    muted: "Tat mic",
    unmuted: "Bat mic",
    endCall: "Tam biet",
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

  // Determine Owl state based on connection/speaking state
  const getOwlState = (): OwlState => {
    if (isConnecting) return 'thinking'
    if (!isConnected) return 'waving'
    if (isAISpeaking) return 'speaking'
    if (isUserSpeaking) return 'listening'
    return 'idle'
  }

  // Determine the main button state
  const getMainButtonContent = () => {
    if (isConnecting) {
      return {
        icon: <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />,
        text: t.connecting,
        className: "bg-accent text-accent-foreground cursor-wait shadow-lg shadow-accent/30",
        disabled: true,
      }
    }

    if (!isConnected) {
      return {
        icon: <Mic className="w-10 h-10" />,
        text: t.disconnected,
        className: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/40 hover:scale-105 active:scale-95",
        disabled: false,
        onClick: onConnect,
      }
    }

    if (isAISpeaking) {
      return {
        icon: <Hand className="w-10 h-10" />,
        text: t.tapToInterrupt,
        className: "bg-accent hover:bg-accent/90 text-accent-foreground animate-bounce-gentle shadow-lg shadow-accent/30",
        disabled: false,
        onClick: onInterrupt,
      }
    }

    if (isUserSpeaking) {
      return {
        icon: <Volume2 className="w-10 h-10" />,
        text: t.speaking,
        className: "bg-success text-success-foreground ring-4 ring-success/30 animate-glow-pulse shadow-lg shadow-success/30",
        disabled: true,
      }
    }

    return {
      icon: <Mic className="w-10 h-10" />,
      text: t.listening,
      className: "bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/30 hover:scale-105",
      disabled: false,
    }
  }

  const mainButton = getMainButtonContent()

  return (
    <div className="space-y-6 py-4">
      {/* Owl Mascot - Shows current state */}
      <div className="flex justify-center">
        <OwlMascot 
          state={getOwlState()} 
          size="lg" 
          showSpeechBubble={isAISpeaking}
          speechText={isAISpeaking ? "..." : ""}
        />
      </div>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-6">
        {/* Mute Button (only when connected) */}
        {isConnected && (
          <Button
            onClick={isMuted ? onUnmute : onMute}
            className={`w-16 h-16 rounded-full transition-all text-white shadow-lg ${
              isMuted 
                ? "bg-destructive hover:bg-destructive/90 shadow-destructive/30" 
                : "bg-muted-foreground/50 hover:bg-muted-foreground/70 shadow-muted-foreground/20"
            }`}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </Button>
        )}

        {/* Main Action Button */}
        <Button
          onClick={mainButton.onClick}
          disabled={mainButton.disabled}
          className={`w-24 h-24 rounded-full font-bold transition-all flex flex-col items-center justify-center ${mainButton.className}`}
        >
          {mainButton.icon}
        </Button>

        {/* End Call Button (only when connected) */}
        {isConnected && (
          <Button
            onClick={onDisconnect}
            className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all shadow-lg shadow-destructive/30 hover:scale-105 active:scale-95"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-bold text-foreground flex items-center justify-center gap-3">
          {isConnected && (
            <span className={`w-3 h-3 rounded-full ${
              isUserSpeaking 
                ? "bg-success animate-pulse" 
                : isAISpeaking 
                  ? "bg-accent animate-pulse"
                  : "bg-muted-foreground/50"
            }`} />
          )}
          {mainButton.text}
        </p>
        
        {isMuted && isConnected && (
          <p className="text-sm text-destructive font-medium">{t.muted}</p>
        )}
      </div>

      {/* Visual Feedback for Voice Activity - Fun animated bars */}
      {isConnected && (
        <div className="flex justify-center items-end gap-1.5 h-8">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-150 ${
                isUserSpeaking 
                  ? "bg-success" 
                  : isAISpeaking 
                    ? "bg-accent"
                    : "bg-muted"
              }`}
              style={{
                height: isUserSpeaking || isAISpeaking
                  ? `${Math.sin((Date.now() / 100) + i) * 12 + 16}px`
                  : "8px",
                transition: "height 100ms ease-out",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
