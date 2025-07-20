"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Loader2 } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  language: "en" | "vi"
}

export function VoiceRecorder({ onTranscription, language }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const translations = {
    en: {
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      processing: "Processing...",
      playback: "Play Recording",
      recordingActive: "Recording Active",
    },
    vi: {
      startRecording: "Bắt Đầu Ghi",
      stopRecording: "Dừng Ghi",
      processing: "Đang Xử Lý...",
      playback: "Phát Lại",
      recordingActive: "Đang Ghi Âm",
    },
  }

  const t = translations[language]

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
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
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Send to speech-to-text API
        setIsProcessing(true)
        try {
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")

          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            onTranscription(result.text)
          }
        } catch (error) {
          console.error("Transcription error:", error)
        } finally {
          setIsProcessing(false)
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }, [onTranscription])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const playRecording = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }, [audioUrl])

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs tracking-wide"
              size="sm"
            >
              <Mic className="w-4 h-4" />
              {t.startRecording}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs tracking-wide"
              size="sm"
            >
              <Square className="w-4 h-4" />
              {t.stopRecording}
            </Button>
          )}

          {audioUrl && !isRecording && (
            <Button
              onClick={playRecording}
              variant="outline"
              size="sm"
              className="gap-2 font-bold text-xs tracking-wide bg-transparent"
            >
              <Play className="w-4 h-4" />
              {t.playback}
            </Button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 tracking-wide">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.processing}
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 tracking-wide">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {t.recordingActive}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
