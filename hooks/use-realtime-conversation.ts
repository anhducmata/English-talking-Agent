"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import type { 
  RealtimeConnectionState, 
  RealtimeMessage, 
  RealtimeHookReturn,
  RealtimeVoice 
} from '@/types/realtime'

interface UseRealtimeConversationOptions {
  voice?: RealtimeVoice
  topic?: string
  difficulty?: number
  mode?: 'casual-chat' | 'speaking-practice' | 'interview'
  onMessage?: (message: RealtimeMessage) => void
  onError?: (error: Error) => void
  onConnectionChange?: (state: RealtimeConnectionState) => void
}

export function useRealtimeConversation(
  options: UseRealtimeConversationOptions = {}
): RealtimeHookReturn {
  const {
    voice = 'shimmer',
    topic = 'general conversation',
    difficulty = 3,
    mode = 'casual-chat',
    onMessage,
    onError,
    onConnectionChange,
  } = options

  // State
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>('disconnected')
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [currentUserTranscript, setCurrentUserTranscript] = useState('')
  const [currentAITranscript, setCurrentAITranscript] = useState('')
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Update connection state with callback
  const updateConnectionState = useCallback((state: RealtimeConnectionState) => {
    setConnectionState(state)
    onConnectionChange?.(state)
  }, [onConnectionChange])

  // Handle incoming data channel messages
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'session.created':
          console.log('[v0] Realtime session created')
          break
          
        case 'input_audio_buffer.speech_started':
          setIsUserSpeaking(true)
          break
          
        case 'input_audio_buffer.speech_stopped':
          setIsUserSpeaking(false)
          break
          
        case 'response.audio_transcript.delta':
          setCurrentAITranscript(prev => prev + (data.delta || ''))
          break
          
        case 'response.audio_transcript.done':
          const aiTranscript = data.transcript || currentAITranscript
          if (aiTranscript) {
            const aiMessage: RealtimeMessage = {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: aiTranscript,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, aiMessage])
            onMessage?.(aiMessage)
          }
          setCurrentAITranscript('')
          break
          
        case 'conversation.item.input_audio_transcription.completed':
          const userTranscript = data.transcript
          if (userTranscript) {
            const userMessage: RealtimeMessage = {
              id: `user-${Date.now()}`,
              role: 'user',
              content: userTranscript,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, userMessage])
            onMessage?.(userMessage)
          }
          setCurrentUserTranscript('')
          break
          
        case 'response.audio.delta':
          setIsAISpeaking(true)
          break
          
        case 'response.audio.done':
        case 'response.done':
          setIsAISpeaking(false)
          break
          
        case 'error':
          const err = new Error(data.error?.message || 'Realtime API error')
          setError(err)
          onError?.(err)
          break
      }
    } catch (e) {
      console.error('[v0] Error parsing data channel message:', e)
    }
  }, [currentAITranscript, onMessage, onError])

  // Connect to OpenAI Realtime API via WebRTC
  const connect = useCallback(async () => {
    try {
      updateConnectionState('connecting')
      setError(null)

      // Get ephemeral token from our API
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice, topic, difficulty, mode }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }

      const { client_secret } = await tokenResponse.json()
      const ephemeralKey = client_secret.value

      // Create peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Create audio element for playback with proper buffering
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioEl.preload = 'auto'
      // Append to document so browser can buffer properly
      document.body.appendChild(audioEl)

      // Handle incoming audio track - ensure proper media stream setup
      pc.ontrack = (event) => {
        console.log('[v0] Received audio track, streams:', event.streams.length)
        if (event.streams.length > 0) {
          audioEl.srcObject = event.streams[0]
          // Ensure autoplay works by setting muted first, then unmuted for real playback
          audioEl.muted = false
          audioEl.volume = 1
        }
      }

      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      mediaStreamRef.current = stream

      // Add audio track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('[v0] Data channel opened')
        updateConnectionState('connected')
        
        // Enable input audio transcription
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            input_audio_transcription: {
              model: 'whisper-1'
            }
          }
        }))
      }

      dc.onmessage = handleDataChannelMessage

      dc.onclose = () => {
        console.log('[v0] Data channel closed')
        updateConnectionState('disconnected')
      }

      // Create and set local description
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Send offer to OpenAI Realtime API
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      )

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime')
      }

      // Set remote description
      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      })

      console.log('[v0] WebRTC connection established')
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Connection failed')
      setError(err)
      onError?.(err)
      updateConnectionState('error')
      console.error('[v0] Realtime connection error:', e)
    }
  }, [voice, topic, difficulty, mode, updateConnectionState, handleDataChannelMessage, onError])

  // Disconnect
  const disconnect = useCallback(() => {
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.srcObject = null
      // Remove from DOM if it was added
      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current)
      }
      audioElementRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setMessages([])
    setCurrentUserTranscript('')
    setCurrentAITranscript('')
    setIsUserSpeaking(false)
    setIsAISpeaking(false)
    updateConnectionState('disconnected')
  }, [updateConnectionState])

  // Send audio data (for push-to-talk mode)
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (dataChannelRef.current?.readyState === 'open') {
      // Convert to base64 and send
      const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)))
      dataChannelRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64,
      }))
    }
  }, [])

  // Interrupt AI response
  const interrupt = useCallback(() => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({
        type: 'response.cancel',
      }))
      setIsAISpeaking(false)
    }
  }, [])

  // Mute/unmute
  const mute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = false
      })
      setIsMuted(true)
    }
  }, [])

  const unmute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = true
      })
      setIsMuted(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isUserSpeaking,
    isAISpeaking,
    currentUserTranscript,
    currentAITranscript,
    messages,
    error,
    connect,
    disconnect,
    sendAudio,
    interrupt,
    mute,
    unmute,
    isMuted,
  }
}
