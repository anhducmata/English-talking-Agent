"use client"

import { useRef, useCallback } from "react"

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

// Minimum word count and confidence to accept a transcript
const MIN_CONFIDENCE = 0.6
const MIN_CHARS = 2
const SILENCE_DURATION_MS = 1800

export function useSpeechRecognition() {
  const speechRecognitionRef = useRef<any>(null)
  const silenceTimerIdRef = useRef<NodeJS.Timeout | null>(null)

  const startSpeechRecognition = useCallback(
    (
      language: string,
      onResult: (transcript: string) => void,
      onSilence: () => void,
      onError: (error: any) => void,
    ) => {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionAPI) {
        onError(new Error("Speech recognition not supported"))
        return
      }

      const recognition = new SpeechRecognitionAPI()

      // Push-to-talk: non-continuous, no interim results.
      // This is the most effective way to prevent hallucinations —
      // the engine only processes audio between start() and stop(),
      // and only emits results when it reaches a natural endpoint.
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 3

      // Explicit locale prevents WebKit from drifting into phonetically
      // similar languages (e.g. Indonesian/Malay when English is expected).
      recognition.lang = language === "en" ? "en-US" : "vi-VN"

      recognition.onresult = (event: any) => {
        let bestTranscript = ""
        let bestConfidence = 0

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (!event.results[i].isFinal) continue

          // Pick the best alternative across all candidates
          for (let j = 0; j < event.results[i].length; j++) {
            const alt = event.results[i][j]
            if (alt.confidence > bestConfidence) {
              bestConfidence = alt.confidence
              bestTranscript = alt.transcript.trim()
            }
          }
        }

        // Hard filters: confidence gate + minimum length
        if (
          bestTranscript.length >= MIN_CHARS &&
          bestConfidence >= MIN_CONFIDENCE
        ) {
          onResult(bestTranscript)

          if (silenceTimerIdRef.current) clearTimeout(silenceTimerIdRef.current)
          silenceTimerIdRef.current = setTimeout(onSilence, SILENCE_DURATION_MS)
        }
      }

      recognition.onerror = (event: any) => {
        // "no-speech" is not a real error — the user simply didn't speak.
        // Suppress it to avoid showing confusing error messages.
        if (event.error === "no-speech") return
        onError(new Error(`Speech recognition error: ${event.error}`))
      }

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
