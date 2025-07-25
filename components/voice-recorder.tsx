"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MicIcon, StopCircleIcon, PlayIcon, PauseIcon, TrashIcon } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  isRecording: boolean
  isProcessing: boolean
  language: "en" | "vi"
}

const translations = {
  en: {
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    playRecording: "Play Recording",
    pauseRecording: "Pause Recording",
    clearRecording: "Clear Recording",
    recording: "Recording...",
    processing: "Processing...",
  },
  vi: {
    startRecording: "Bắt Đầu Ghi Âm",
    stopRecording: "Dừng Ghi Âm",
    playRecording: "Phát Ghi Âm",
    pauseRecording: "Tạm Dừng Ghi Âm",
    clearRecording: "Xóa Ghi Âm",
    recording: "Đang ghi âm...",
    processing: "Đang xử lý...",
  },
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  isRecording,
  isProcessing,
  language,
}: VoiceRecorderProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const t = translations[language]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onpause = () => setIsPlaying(false)
      audioRef.current.onplay = () => setIsPlaying(true)
    }
  }, [audioUrl])

  const startRecordingInternal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        onRecordingComplete(blob, url)
        stream.getTracks().forEach((track) => track.stop()) // Stop microphone access
      }

      mediaRecorderRef.current.start()
      onRecordingStart?.()
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecordingInternal = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      onRecordingStop?.()
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
  }

  return (
    <div className="flex items-center space-x-2">
      {!isRecording && !audioUrl && (
        <Button onClick={startRecordingInternal} disabled={isProcessing}>
          <MicIcon className="w-4 h-4 mr-2" />
          {t.startRecording}
        </Button>
      )}

      {isRecording && (
        <Button onClick={stopRecordingInternal} variant="destructive">
          <StopCircleIcon className="w-4 h-4 mr-2" />
          {t.stopRecording}
        </Button>
      )}

      {audioUrl && (
        <>
          <Button onClick={togglePlayPause} disabled={isProcessing}>
            {isPlaying ? <PauseIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            {isPlaying ? t.pauseRecording : t.playRecording}
          </Button>
          <Button onClick={clearRecording} variant="outline" disabled={isProcessing}>
            <TrashIcon className="w-4 h-4 mr-2" />
            {t.clearRecording}
          </Button>
        </>
      )}

      {isRecording && <span className="text-sm text-gray-400 animate-pulse">{t.recording}</span>}
      {isProcessing && <span className="text-sm text-gray-400 animate-pulse">{t.processing}</span>}

      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
    </div>
  )
}
