import { CloudStorageService, CloudConversationEntry } from './cloud-storage-service'
import { 
  saveConversation as saveLocalConversation, 
  getConversationHistory as getLocalConversationHistory,
  getConversationById as getLocalConversationById,
  deleteConversation as deleteLocalConversation,
  clearAllConversations as clearLocalConversations,
  ConversationEntry
} from './conversation-storage'

// Configuration
const USE_CLOUD_STORAGE = process.env.NEXT_PUBLIC_USE_CLOUD_STORAGE === 'true'

export interface UnifiedConversationEntry extends ConversationEntry {
  audioS3Key?: string // Additional field for cloud storage
}

/**
 * Unified conversation storage service that can use either local or cloud storage
 */
export class UnifiedStorageService {
  
  /**
   * Save conversation using the configured storage method
   */
  static async saveConversation(conversation: ConversationEntry): Promise<void> {
    if (USE_CLOUD_STORAGE) {
      try {
        await CloudStorageService.saveConversation(conversation)
        return
      } catch (error) {
        console.error('Cloud storage failed, falling back to local storage:', error)
        // Fall back to local storage
      }
    }
    
    // Use local storage
    await saveLocalConversation(conversation)
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(id: string): Promise<ConversationEntry | null> {
    if (USE_CLOUD_STORAGE) {
      try {
        const conversation = await CloudStorageService.getConversationById(id)
        return conversation ? this.convertFromCloudFormat(conversation) : null
      } catch (error) {
        console.error('Cloud storage failed, falling back to local storage:', error)
      }
    }
    
    // Use local storage
    return getLocalConversationById(id) || null
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(limit: number = 50): Promise<ConversationEntry[]> {
    if (USE_CLOUD_STORAGE) {
      try {
        const conversations = await CloudStorageService.getConversationHistory(undefined, limit)
        return conversations.map(conv => this.convertFromCloudFormat(conv))
      } catch (error) {
        console.error('Cloud storage failed, falling back to local storage:', error)
      }
    }
    
    // Use local storage
    return getLocalConversationHistory()
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(id: string): Promise<void> {
    if (USE_CLOUD_STORAGE) {
      try {
        await CloudStorageService.deleteConversation(id)
        return
      } catch (error) {
        console.error('Cloud storage failed, falling back to local storage:', error)
      }
    }
    
    // Use local storage
    deleteLocalConversation(id)
  }

  /**
   * Clear all conversations
   */
  static async clearAllConversations(): Promise<void> {
    if (USE_CLOUD_STORAGE) {
      try {
        await CloudStorageService.clearAllConversations()
        return
      } catch (error) {
        console.error('Cloud storage failed, falling back to local storage:', error)
      }
    }
    
    // Use local storage
    clearLocalConversations()
  }

  /**
   * Update conversation analysis
   */
  static async updateConversationAnalysis(id: string, analysis: any): Promise<void> {
    if (USE_CLOUD_STORAGE) {
      try {
        await CloudStorageService.updateConversationAnalysis(id, analysis)
        return
      } catch (error) {
        console.error('Cloud storage failed for analysis update:', error)
      }
    }
    
    // For local storage, we need to get the conversation, update it, and save it back
    const conversation = await this.getConversationById(id)
    if (conversation) {
      conversation.analysis = analysis
      await this.saveConversation(conversation)
    }
  }

  /**
   * Get audio URL (for cloud storage) or return the existing URL (for local storage)
   */
  static async getAudioUrl(audioData: string): Promise<string | null> {
    if (USE_CLOUD_STORAGE && audioData && !audioData.startsWith('blob:') && !audioData.startsWith('data:')) {
      // Assume it's an S3 key, get signed URL
      try {
        return await CloudStorageService.getAudioUrl(audioData)
      } catch (error) {
        console.error('Error getting audio URL from cloud:', error)
        return null
      }
    }
    
    // For local storage or blob URLs, return as-is
    return audioData
  }

  /**
   * Check if cloud storage is available and configured
   */
  static isCloudStorageEnabled(): boolean {
    return USE_CLOUD_STORAGE
  }

  /**
   * Convert cloud conversation format to local format
   */
  private static convertFromCloudFormat(cloudConv: CloudConversationEntry): ConversationEntry {
    return {
      id: cloudConv.id,
      timestamp: cloudConv.timestamp,
      messages: cloudConv.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        audioData: msg.audioS3Key || msg.audioUrl, // Use S3 key or URL
      })),
      config: cloudConv.config,
      callEnded: cloudConv.callEnded,
      timeRemaining: cloudConv.timeRemaining,
      analysis: cloudConv.analysis,
      startTime: cloudConv.startTime,
      endTime: cloudConv.endTime,
      duration: cloudConv.duration,
    }
  }

  /**
   * Migrate existing local data to cloud storage
   */
  static async migrateToCloud(): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
    if (!USE_CLOUD_STORAGE) {
      return {
        success: false,
        migratedCount: 0,
        errors: ['Cloud storage is not enabled'],
      }
    }

    try {
      // Use the migration utility
      const { migrateToCloudStorage } = await import('./migration-utils')
      return await migrateToCloudStorage()
    } catch (error) {
      return {
        success: false,
        migratedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      }
    }
  }
}
