"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff } from "lucide-react"

interface VoiceControlsProps {
  isRecording: boolean
  isProcessing: boolean
  isAIThinking: boolean
  isSpeakingDetected: boolean
  language: "en" | "vi"
  onStartRecording: () => void
  onStopRecording: () => void
  onEndCall: () => Promise<void> // Make this async
}

const translations = {
  en: {
    speakButton: "Start Recording",
    processing: "Processing...",
  },
  vi: {
    speakButton: "Bắt đầu ghi âm",
    processing: "Đang xử lý...",
  },
}

export function VoiceControls({
  isRecording,
  isProcessing,
  isAIThinking,
  isSpeakingDetected,
  language,
  onStartRecording,
  onStopRecording,
  onEndCall,
}: VoiceControlsProps) {
  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <div className="flex justify-center items-center gap-6">
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing || isAIThinking}
          className={`w-32 h-16 rounded-full text-white font-bold text-base transition-all flex items-center justify-center gap-2 ${
            isRecording ? "bg-red-500 hover:bg-red-600 scale-105" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          {isRecording ? "Send" : "Speak"}
        </Button>

        <Button
          onClick={async () => await onEndCall()}
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
                className={`w-3 h-3 rounded-full ${
                  isSpeakingDetected ? "bg-emerald-500 animate-pulse" : "bg-gray-500"
                }`}
              ></div>
              Listening...
            </>
          ) : isProcessing || isAIThinking ? (
            "Processing..."
          ) : (
            "Click to Speak"
          )}
        </p>
      </div>
    </div>
  )
}
