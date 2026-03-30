"use client"

import { useRef, useCallback } from "react"
import type { SpeechRecognitionErrorEvent } from "web-speech-api"

declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition() {
  const speechRecognitionRef = useRef<any>(null)
  const silenceTimerIdRef = useRef<NodeJS.Timeout | null>(null)
  const SILENCE_DURATION_MS = 1500 // Reduced from 2000ms to 1500ms for faster response, but still robust

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
      recognition.maxAlternatives = 1
      // Lock the language explicitly. Using "en-US" alone can sometimes cause
      // WebKit to drift into phonetically similar languages (Indonesian, Malay, etc.).
      // Setting a specific locale prevents ambiguous auto-detection.
      recognition.lang = language === "en" ? "en-US" : "vi-VN"

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let hasHighConfidence = false

        // Only process final results, ignore interim results to prevent hallucinations
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim()
            const confidence = event.results[i][0].confidence || 0
            
            // Filter: Only accept results with >0.5 confidence and minimum 2 characters
            if (confidence > 0.5 && transcript.length > 1) {
              finalTranscript += transcript + " "
              hasHighConfidence = true
            }
          }
        }

        // Only call onResult if we have high-confidence final text
        if (hasHighConfidence && finalTranscript.trim().length > 0) {
          onResult(finalTranscript.trim())

          // Reset silence timer on any new speech
          if (silenceTimerIdRef.current) {
            clearTimeout(silenceTimerIdRef.current)
          }
          silenceTimerIdRef.current = setTimeout(() => {
            onSilence()
          }, SILENCE_DURATION_MS)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError(
          new Error(`Speech recognition error: ${event.error} - ${event.message || "An unknown error occurred."}`),
        )
      }
      // The `onend` event is not an error and should not trigger the error handler.
      // The `handleStopRecording` in `app/practice/page.tsx` already handles stopping recognition.

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
