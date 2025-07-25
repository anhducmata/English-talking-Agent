"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { SpeakerIcon, PauseIcon } from "@radix-ui/react-icons"

interface AiVoicePlayerProps {
  audioUrl: string
}

export function AiVoicePlayer({ audioUrl }: AiVoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
    audioRef.current = new Audio(audioUrl)
    audioRef.current.onended = () => setIsPlaying(false)
    audioRef.current.onplay = () => setIsPlaying(true)
    audioRef.current.onpause = () => setIsPlaying(false)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
        audioRef.current.onplay = null
        audioRef.current.onpause = null
      }
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-gray-400 hover:text-white">
      {isPlaying ? <PauseIcon className="h-4 w-4" /> : <SpeakerIcon className="h-4 w-4" />}
      <span className="sr-only">{isPlaying ? "Pause AI voice" : "Play AI voice"}</span>
    </Button>
  )
}
