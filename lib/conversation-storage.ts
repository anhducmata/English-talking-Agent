export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

export interface SavedConversation {
  id: string
  topic: string
  difficulty: number
  timeLimit: number // Actual minutes, not the index
  voice: string
  language: "en" | "vi"
  timestamp: number // Unix timestamp for sorting
  messages: ConversationMessage[]
}

export interface ConversationStats {
  totalConversations: number
  totalMinutesPracticed: number
}

const STORAGE_KEY = "englishPracticeConversations"

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function saveConversation(conversation: SavedConversation): void {
  try {
    const existingConversations = loadAllConversations()
    const updatedConversations = existingConversations.filter((c) => c.id !== conversation.id)
    updatedConversations.push(conversation)

    // Sort by timestamp (newest first)
    updatedConversations.sort((a, b) => b.timestamp - a.timestamp)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations))
  } catch (error) {
    console.error("Error saving conversation:", error)
  }
}

export function loadConversation(conversationId: string): SavedConversation | null {
  try {
    const conversations = loadAllConversations()
    return conversations.find((c) => c.id === conversationId) || null
  } catch (error) {
    console.error("Error loading conversation:", error)
    return null
  }
}

/** Load a single conversation by its id (alias kept for backward-compat) */
export function loadConversationById(id: string): SavedConversation | null {
  return loadConversation(id)
}

export function loadAllConversations(): SavedConversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const conversations = JSON.parse(stored) as SavedConversation[]

    // Convert timestamp strings back to Date objects for messages
    return conversations
      .map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error("Error loading conversations:", error)
    return []
  }
}

export function deleteConversation(conversationId: string): void {
  try {
    const conversations = loadAllConversations()
    const filtered = conversations.filter((c) => c.id !== conversationId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting conversation:", error)
  }
}

export function getConversationStats(): ConversationStats {
  try {
    const conversations = loadAllConversations()
    return {
      totalConversations: conversations.length,
      totalMinutesPracticed: conversations.reduce((total, conv) => total + conv.timeLimit, 0),
    }
  } catch (error) {
    console.error("Error calculating stats:", error)
    return { totalConversations: 0, totalMinutesPracticed: 0 }
  }
}

export function updateConversationMessages(conversationId: string, messages: ConversationMessage[]): void {
  try {
    const conversations = loadAllConversations()
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId)

    if (conversationIndex !== -1) {
      conversations[conversationIndex].messages = messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    }
  } catch (error) {
    console.error("Error updating conversation messages:", error)
  }
}
