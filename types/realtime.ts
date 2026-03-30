// OpenAI Realtime API Types

export type RealtimeConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export type RealtimeVoice = 
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'coral'
  | 'echo'
  | 'sage'
  | 'shimmer'
  | 'verse'

export interface RealtimeSessionConfig {
  model: string
  voice: RealtimeVoice
  instructions: string
  input_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  output_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  turn_detection: {
    type: 'server_vad'
    threshold?: number
    prefix_padding_ms?: number
    silence_duration_ms?: number
  } | null
  modalities: ('text' | 'audio')[]
  temperature?: number
  max_response_output_tokens?: number | 'inf'
}

export interface RealtimeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioData?: ArrayBuffer
}

export interface RealtimeEvents {
  // Session events
  onSessionCreated?: () => void
  onSessionUpdated?: () => void
  onError?: (error: Error) => void
  
  // Connection events
  onConnectionStateChange?: (state: RealtimeConnectionState) => void
  
  // Conversation events
  onUserSpeechStarted?: () => void
  onUserSpeechStopped?: () => void
  onAISpeechStarted?: () => void
  onAISpeechStopped?: () => void
  
  // Transcript events
  onUserTranscript?: (transcript: string, isFinal: boolean) => void
  onAITranscript?: (transcript: string, isFinal: boolean) => void
  
  // Audio events
  onAudioReceived?: (audioData: ArrayBuffer) => void
  
  // Message events
  onMessageComplete?: (message: RealtimeMessage) => void
}

export interface RealtimeHookReturn {
  // State
  connectionState: RealtimeConnectionState
  isConnected: boolean
  isUserSpeaking: boolean
  isAISpeaking: boolean
  currentUserTranscript: string
  currentAITranscript: string
  messages: RealtimeMessage[]
  error: Error | null
  
  // Actions
  connect: (config?: Partial<RealtimeSessionConfig>) => Promise<void>
  disconnect: () => void
  sendAudio: (audioData: ArrayBuffer) => void
  interrupt: () => void
  mute: () => void
  unmute: () => void
  isMuted: boolean
}

// Server response types
export interface EphemeralTokenResponse {
  client_secret: {
    value: string
    expires_at: number
  }
}

export interface RealtimeServerEvent {
  type: string
  event_id?: string
  // Different event types have different payloads
  [key: string]: unknown
}

// Child safety specific
export interface ChildSafeConfig {
  maxResponseLength: number
  blockedTopics: string[]
  encouragingTone: boolean
  simpleVocabulary: boolean
  ageGroup: '6-9' | '10-12' | '6-12'
}

export const DEFAULT_CHILD_SAFE_CONFIG: ChildSafeConfig = {
  maxResponseLength: 150,
  blockedTopics: [
    'violence',
    'weapons',
    'drugs',
    'alcohol',
    'adult content',
    'gambling',
    'horror',
    'politics',
    'religion controversies'
  ],
  encouragingTone: true,
  simpleVocabulary: true,
  ageGroup: '6-12'
}
