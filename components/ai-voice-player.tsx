"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Loader2, Play, Pause } from "lucide-react"

interface AIVoicePlayerProps {
  text: string
  voice: string
  language: "en" | "vi"
}

export function AIVoicePlayer({ text, voice, language }: AIVoicePlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const translations = {
    en: {
      title: "AI Response",
      generateSpeech: "Generate Speech",
      play: "Play",
      pause: "Pause",
      generating: "Generating...",
    },
    vi: {
      title: "Phản Hồi AI",
      generateSpeech: "Tạo Giọng Nói",
      play: "Phát",
      pause: "Tạm Dừng",
      generating: "Đang Tạo...",
    },
  }

  const t = translations[language]

  const generateSpeech = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice: voice || "alloy",
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Auto-play the generated audio
        const audio = new Audio(url)
        audioRef.current = audio

        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => setIsPlaying(false)

        audio.play()
      }
    } catch (error) {
      console.error("TTS error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900 tracking-wide">
          <Volume2 className="w-4 h-4 text-teal-600" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 tracking-wide leading-relaxed">{text}</p>

          <div className="flex items-center gap-2">
            {!audioUrl ? (
              <Button
                onClick={generateSpeech}
                disabled={isLoading || !text.trim()}
                size="sm"
                className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wide"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    {t.generateSpeech}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={togglePlayback}
                size="sm"
                className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wide"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    {t.pause}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {t.play}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
