"use client"

import { useRef, useCallback } from "react"

declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition() {
  const speechRecognitionRef = useRef<any>(null)
  const silenceTimerIdRef = useRef<NodeJS.Timeout | null>(null)
  const SILENCE_DURATION_MS = 2000

  const startSpeechRecognition = useCallback(
    (
      language: string,
      onResult: (transcript: string) => void,
      onSilence: () => void,
      onError: (error: any) => void,
    ) => {
      if (!("webkitSpeechRecognition" in window)) {
        onError(new Error("Speech recognition not supported"))
        return
      }

      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language === "en" ? "en-US" : "vi-VN"

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        onResult(interimTranscript || finalTranscript)

        // Reset silence timer on any new speech
        if (silenceTimerIdRef.current) {
          clearTimeout(silenceTimerIdRef.current)
        }
        silenceTimerIdRef.current = setTimeout(() => {
          onSilence()
        }, SILENCE_DURATION_MS)
      }

      recognition.onerror = onError
      recognition.onend = onError

      speechRecognitionRef.current = recognition
      recognition.start()
    },
    [],
  )

  const stopSpeechRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      speechRecognitionRef.current = null
    }
    if (silenceTimerIdRef.current) {
      clearTimeout(silenceTimerIdRef.current)
      silenceTimerIdRef.current = null
    }
  }, [])

  return {
    startSpeechRecognition,
    stopSpeechRecognition,
  }
}
