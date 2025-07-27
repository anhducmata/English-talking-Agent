import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database operations
export class PrismaConversationService {
  
  static async saveConversation(conversation: any) {
    // Convert the conversation data to match Prisma schema
    const conversationData = {
      id: conversation.id,
      userId: conversation.userId || null,
      timestamp: new Date(conversation.timestamp),
      callEnded: conversation.callEnded,
      timeRemaining: conversation.timeRemaining,
      analysis: conversation.analysis || null,
      startTime: new Date(conversation.startTime),
      endTime: conversation.endTime ? new Date(conversation.endTime) : null,
      duration: conversation.duration,
      
      // Configuration fields
      topic: conversation.config.topic,
      difficulty: conversation.config.difficulty,
      voice: conversation.config.voice,
      timeLimit: conversation.config.timeLimit,
      language: conversation.config.language.toUpperCase() as 'EN' | 'VI',
      mode: conversation.config.mode.replace('-', '_').toUpperCase() as 'CASUAL_CHAT' | 'SPEAKING_PRACTICE' | 'INTERVIEW',
    }

    const messages = conversation.messages.map((msg: any) => ({
      id: msg.id,
      role: msg.role.toUpperCase() as 'USER' | 'ASSISTANT',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      audioS3Key: msg.audioS3Key || null,
      audioUrl: msg.audioUrl || null,
    }))

    try {
      return await prisma.conversation.upsert({
        where: { id: conversation.id },
        update: {
          ...conversationData,
          messages: {
            deleteMany: {}, // Remove existing messages
            create: messages, // Add updated messages
          },
        },
        create: {
          ...conversationData,
          messages: {
            create: messages,
          },
        },
        include: {
          messages: true,
        },
      })
    } catch (error) {
      console.error('Error saving conversation:', error)
      throw error
    }
  }

  static async getConversationById(id: string) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })
  }

  static async getConversationHistory(userId?: string, limit: number = 50) {
    const where = userId ? { userId } : {}
    
    return await prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  static async deleteConversation(id: string) {
    return await prisma.conversation.delete({
      where: { id },
    })
  }

  static async clearAllConversations(userId?: string) {
    const where = userId ? { userId } : {}
    
    return await prisma.conversation.deleteMany({
      where,
    })
  }

  static async updateConversationAnalysis(id: string, analysis: any) {
    return await prisma.conversation.update({
      where: { id },
      data: { 
        analysis,
        updatedAt: new Date(),
      },
      include: {
        messages: true,
      },
    })
  }

  // Helper method to convert Prisma result to frontend format
  static convertToFrontendFormat(conversation: any) {
    if (!conversation) return null

    return {
      id: conversation.id,
      timestamp: conversation.timestamp.toISOString(),
      messages: conversation.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role.toLowerCase(),
        content: msg.content,
        timestamp: msg.timestamp.getTime(),
        audioData: msg.audioS3Key, // Store S3 key instead of audioData
        audioUrl: msg.audioUrl,
      })),
      config: {
        topic: conversation.topic,
        difficulty: conversation.difficulty,
        voice: conversation.voice,
        timeLimit: conversation.timeLimit,
        language: conversation.language.toLowerCase(),
        mode: conversation.mode.toLowerCase().replace('_', '-'),
      },
      callEnded: conversation.callEnded,
      timeRemaining: conversation.timeRemaining,
      analysis: conversation.analysis,
      startTime: conversation.startTime.getTime(),
      endTime: conversation.endTime ? conversation.endTime.getTime() : undefined,
      duration: conversation.duration,
    }
  }
}
