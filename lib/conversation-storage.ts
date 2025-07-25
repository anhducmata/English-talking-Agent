export interface ConversationEntry {
  id: string
  timestamp: string // ISO string
  messages: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: number // Store as timestamp number
    audioData?: string // Store audio as base64 string instead of blob URL
  }[]
  config: {
    topic: string
    difficulty: number
    voice: string
    timeLimit: number
    language: "en" | "vi"
    mode: "casual-chat" | "speaking-practice" | "interview"
  }
  callEnded: boolean
  timeRemaining: number
  analysis?: any
  startTime: number
  endTime?: number
  duration: number // in minutes
}

// Legacy support for old conversation format
export interface Conversation {
  id: string
  topic: string
  difficulty: number
  timeLimit: number
  voice: string
  language: "en" | "vi"
  mode: "casual-chat" | "speaking-practice" | "interview"
  startTime: number
  endTime: number
  duration: number
  messages: {
    id: string
    text: string
    isUser: boolean
    timestamp: number
    audioUrl?: string
  }[]
}

const CONVERSATION_HISTORY_KEY = "conversationHistory"

// Helper function to convert blob URL to base64
export async function blobUrlToBase64(blobUrl: string): Promise<string | null> {
  try {
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error converting blob URL to base64:", error)
    return null
  }
}

// Helper function to convert base64 to blob URL
export function base64ToBlobUrl(base64: string): string {
  try {
    const byteCharacters = atob(base64.split(",")[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "audio/webm" })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("Error converting base64 to blob URL:", error)
    return ""
  }
}

export async function saveConversation(conversation: ConversationEntry) {
  try {
    const history = getConversationHistory()
    const existingIndex = history.findIndex((conv) => conv.id === conversation.id)

    // Convert blob URLs to base64 for storage
    const messagesWithAudioData = await Promise.all(
      conversation.messages.map(async (msg) => {
        if (msg.audioData && msg.audioData.startsWith("blob:")) {
          // Convert blob URL to base64
          const base64Data = await blobUrlToBase64(msg.audioData)
          return {
            ...msg,
            audioData: base64Data || undefined,
          }
        }
        return msg
      }),
    )

    const cleanedConversation = {
      ...conversation,
      messages: messagesWithAudioData,
    }

    if (existingIndex > -1) {
      history[existingIndex] = cleanedConversation
    } else {
      history.unshift(cleanedConversation) // Add to the beginning
    }

    // Limit history to 50 conversations
    if (history.length > 50) {
      history.splice(50)
    }

    localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(history))
    console.log("Conversation saved:", cleanedConversation.id)
  } catch (error) {
    console.error("Failed to save conversation to local storage:", error)
  }
}

export function getConversationHistory(): ConversationEntry[] {
  try {
    const historyString = localStorage.getItem(CONVERSATION_HISTORY_KEY)
    if (!historyString) return []

    const history = JSON.parse(historyString)

    // Handle legacy format conversion
    return history.map((conv: any) => {
      if (conv.messages && conv.messages[0] && typeof conv.messages[0].isUser !== "undefined") {
        // Legacy format - convert to new format
        return {
          id: conv.id,
          timestamp: new Date(conv.endTime || conv.startTime || Date.now()).toISOString(),
          messages: conv.messages.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.isUser ? "user" : "assistant",
            content: msg.text || msg.content || "",
            timestamp: msg.timestamp || Date.now(),
            audioData: undefined,
          })),
          config: {
            topic: conv.topic || "Unknown Topic",
            difficulty: conv.difficulty || 3,
            voice: conv.voice || "alloy",
            timeLimit: conv.timeLimit || 10,
            language: conv.language || "en",
            mode: conv.mode || "speaking-practice",
          },
          callEnded: true,
          timeRemaining: 0,
          startTime: conv.startTime || Date.now(),
          endTime: conv.endTime || Date.now(),
          duration: conv.duration || 0,
        }
      }

      // New format - return as is
      return conv
    })
  } catch (error) {
    console.error("Failed to load conversation history from local storage:", error)
    return []
  }
}

export function getConversationById(id: string): ConversationEntry | undefined {
  const history = getConversationHistory()
  return history.find((conv) => conv.id === id)
}

export function deleteConversation(id: string) {
  try {
    let history = getConversationHistory()
    history = history.filter((conv) => conv.id !== id)
    localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(history))
    console.log("Conversation deleted:", id)
  } catch (error) {
    console.error("Failed to delete conversation from local storage:", error)
  }
}

export function clearAllConversations() {
  try {
    localStorage.removeItem(CONVERSATION_HISTORY_KEY)
    console.log("All conversations cleared")
  } catch (error) {
    console.error("Failed to clear all conversations from local storage:", error)
  }
}

export function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
