import { validateS3Config, uploadUserAudio, uploadAIAudio, getAudioSignedUrl, deleteAudioFromS3 } from './s3-service'
import { ConversationService } from './mongodb-service'
import { PrismaConversationService } from './prisma-service'

// Configuration to choose between MongoDB and PostgreSQL
const USE_MONGODB = process.env.DATABASE_TYPE === 'mongodb' || !process.env.DATABASE_URL?.includes('postgresql')

export interface CloudConversationEntry {
  id: string
  timestamp: string
  messages: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: number
    audioS3Key?: string // S3 key instead of audioData
    audioUrl?: string // Signed URL for playback
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
  duration: number
}

export class CloudStorageService {
  private static dbService = USE_MONGODB ? ConversationService : PrismaConversationService

  /**
   * Save conversation with S3 audio upload
   */
  static async saveConversation(conversation: any): Promise<CloudConversationEntry> {
    const useS3 = validateS3Config()
    
    // Process messages and upload audio to S3 if configured
    const processedMessages = await Promise.all(
      conversation.messages.map(async (msg: any) => {
        let audioS3Key: string | undefined
        let audioUrl: string | undefined

        if (msg.audioData && useS3) {
          try {
            if (msg.audioData.startsWith('blob:')) {
              // Convert blob URL to actual blob and upload
              const response = await fetch(msg.audioData)
              const blob = await response.blob()
              
              if (msg.role === 'user') {
                const result = await uploadUserAudio(blob, conversation.id, msg.id)
                audioS3Key = result.key
              }
            } else if (msg.audioData.startsWith('data:audio')) {
              // Handle base64 audio data (from localStorage migration)
              const base64Data = msg.audioData.split(',')[1]
              const buffer = Buffer.from(base64Data, 'base64')
              
              if (msg.role === 'user') {
                const result = await uploadUserAudio(new Blob([buffer]), conversation.id, msg.id)
                audioS3Key = result.key
              }
            }

            // Get signed URL for immediate playback
            if (audioS3Key) {
              audioUrl = await getAudioSignedUrl(audioS3Key)
            }
          } catch (error) {
            console.error('Error uploading audio to S3:', error)
            // Fall back to storing audio data locally if S3 fails
          }
        }

        return {
          ...msg,
          audioS3Key,
          audioUrl,
          audioData: undefined, // Remove audioData since we're using S3
        }
      })
    )

    const cloudConversation = {
      ...conversation,
      messages: processedMessages,
    }

    // Save to database
    await this.dbService.saveConversation(cloudConversation)
    
    return cloudConversation
  }

  /**
   * Get conversation by ID with signed URLs for audio
   */
  static async getConversationById(id: string): Promise<CloudConversationEntry | null> {
    const conversation = await this.dbService.getConversationById(id)
    
    if (!conversation) return null

    // Convert to frontend format if using Prisma
    const formattedConversation = USE_MONGODB ? conversation : PrismaConversationService.convertToFrontendFormat(conversation)
    
    if (!formattedConversation) return null

    // Generate fresh signed URLs for audio playback
    if (validateS3Config()) {
      formattedConversation.messages = await Promise.all(
        formattedConversation.messages.map(async (msg: any) => {
          if (msg.audioS3Key) {
            try {
              msg.audioUrl = await getAudioSignedUrl(msg.audioS3Key)
            } catch (error) {
              console.error('Error generating signed URL:', error)
            }
          }
          return msg
        })
      )
    }

    return formattedConversation
  }

  /**
   * Get conversation history with signed URLs
   */
  static async getConversationHistory(userId?: string, limit: number = 50): Promise<CloudConversationEntry[]> {
    const conversations = await this.dbService.getConversationHistory(userId, limit)
    
    if (!validateS3Config()) {
      return USE_MONGODB ? conversations : conversations.map(PrismaConversationService.convertToFrontendFormat).filter(Boolean)
    }

    // Generate signed URLs for recent conversations (to avoid too many S3 requests)
    const processedConversations = await Promise.all(
      conversations.slice(0, 10).map(async (conv: any) => { // Only process first 10 for performance
        const formattedConv = USE_MONGODB ? conv : PrismaConversationService.convertToFrontendFormat(conv)
        
        if (formattedConv) {
          formattedConv.messages = await Promise.all(
            formattedConv.messages.map(async (msg: any) => {
              if (msg.audioS3Key) {
                try {
                  msg.audioUrl = await getAudioSignedUrl(msg.audioS3Key, 3600) // 1 hour expiry
                } catch (error) {
                  console.error('Error generating signed URL:', error)
                }
              }
              return msg
            })
          )
        }
        
        return formattedConv
      })
    )

    // Add remaining conversations without signed URLs (they'll be generated on demand)
    const remainingConversations = conversations.slice(10).map((conv: any) => 
      USE_MONGODB ? conv : PrismaConversationService.convertToFrontendFormat(conv)
    ).filter(Boolean)

    return [...processedConversations, ...remainingConversations]
  }

  /**
   * Delete conversation and associated S3 audio files
   */
  static async deleteConversation(id: string): Promise<void> {
    // Get conversation to find S3 keys
    const conversation = await this.getConversationById(id)
    
    if (conversation && validateS3Config()) {
      // Delete all audio files from S3
      const deletePromises = conversation.messages
        .filter(msg => msg.audioS3Key)
        .map(msg => deleteAudioFromS3(msg.audioS3Key!))
      
      await Promise.allSettled(deletePromises)
    }

    // Delete from database
    await this.dbService.deleteConversation(id)
  }

  /**
   * Clear all conversations and S3 audio files
   */
  static async clearAllConversations(userId?: string): Promise<void> {
    if (validateS3Config()) {
      // Get all conversations to find S3 keys
      const conversations = await this.getConversationHistory(userId, 1000)
      
      // Delete all audio files from S3
      const deletePromises = conversations
        .flatMap(conv => conv.messages)
        .filter(msg => msg.audioS3Key)
        .map(msg => deleteAudioFromS3(msg.audioS3Key!))
      
      await Promise.allSettled(deletePromises)
    }

    // Clear database
    await this.dbService.clearAllConversations(userId)
  }

  /**
   * Upload AI-generated audio to S3 and return signed URL
   */
  static async saveAIAudio(audioBuffer: ArrayBuffer, conversationId: string, messageId: string): Promise<string | null> {
    if (!validateS3Config()) return null

    try {
      const result = await uploadAIAudio(audioBuffer, conversationId, messageId)
      return await getAudioSignedUrl(result.key)
    } catch (error) {
      console.error('Error saving AI audio:', error)
      return null
    }
  }

  /**
   * Get fresh signed URL for audio
   */
  static async getAudioUrl(s3Key: string): Promise<string | null> {
    if (!validateS3Config()) return null

    try {
      return await getAudioSignedUrl(s3Key)
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return null
    }
  }

  /**
   * Update conversation analysis
   */
  static async updateConversationAnalysis(id: string, analysis: any): Promise<void> {
    await this.dbService.updateConversationAnalysis(id, analysis)
  }
}
