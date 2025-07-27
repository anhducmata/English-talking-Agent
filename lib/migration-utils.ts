import { CloudStorageService } from './cloud-storage-service'
import { getConversationHistory, base64ToBlobUrl } from './conversation-storage'

export interface MigrationResult {
  success: boolean
  migratedCount: number
  errors: string[]
}

/**
 * Migrate conversations from localStorage to cloud storage
 */
export async function migrateToCloudStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
  }

  try {
    // Get all conversations from localStorage
    const localConversations = getConversationHistory()
    
    console.log(`Starting migration of ${localConversations.length} conversations...`)

    for (const conversation of localConversations) {
      try {
        // Convert base64 audio data back to blob URLs for processing
        const processedConversation = {
          ...conversation,
          messages: conversation.messages.map(msg => ({
            ...msg,
            audioData: msg.audioData ? base64ToBlobUrl(msg.audioData) : undefined,
          })),
        }

        // Save to cloud storage
        await CloudStorageService.saveConversation(processedConversation)
        result.migratedCount++
        
        console.log(`Migrated conversation: ${conversation.id}`)
      } catch (error) {
        const errorMsg = `Failed to migrate conversation ${conversation.id}: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMsg)
        result.errors.push(errorMsg)
        result.success = false
      }
    }

    console.log(`Migration completed. ${result.migratedCount} conversations migrated successfully.`)
    
    if (result.errors.length > 0) {
      console.log(`${result.errors.length} errors occurred during migration.`)
    }

  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : String(error)}`
    console.error(errorMsg)
    result.success = false
    result.errors.push(errorMsg)
  }

  return result
}

/**
 * Verify cloud storage configuration
 */
export function verifyCloudConfig(): { isValid: boolean; missing: string[] } {
  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'S3_BUCKET_NAME'
  ]

  const missing = required.filter(key => !process.env[key])
  
  // Check if either MongoDB or PostgreSQL is configured
  const hasDatabase = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!hasDatabase) {
    missing.push('MONGODB_URI or DATABASE_URL')
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}

/**
 * Test cloud storage functionality
 */
export async function testCloudStorage(): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a test conversation
    const testConversation = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      messages: [
        {
          id: 'test-msg-1',
          role: 'user' as const,
          content: 'Test message',
          timestamp: Date.now(),
        },
      ],
      config: {
        topic: 'Test Topic',
        difficulty: 3,
        voice: 'alloy',
        timeLimit: 10,
        language: 'en' as const,
        mode: 'casual-chat' as const,
      },
      callEnded: true,
      timeRemaining: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 1,
    }

    // Test save
    await CloudStorageService.saveConversation(testConversation)
    
    // Test retrieve
    const retrieved = await CloudStorageService.getConversationById(testConversation.id)
    if (!retrieved) {
      throw new Error('Failed to retrieve test conversation')
    }

    // Test delete
    await CloudStorageService.deleteConversation(testConversation.id)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
