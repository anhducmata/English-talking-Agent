import mongoose from 'mongoose'

// Connection
let isConnected = false

export async function connectMongoDB() {
  if (isConnected) return

  // Skip connection if no MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.warn('[v0] MongoDB connection skipped - MONGODB_URI not configured')
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    isConnected = true
    console.log('[v0] MongoDB connected successfully')
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error)
    // Don't throw - allow graceful fallback to other storage
  }
}

// Message Schema
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  audioS3Key: { type: String },
  audioUrl: { type: String },
})

// Conversation Configuration Schema
const ConversationConfigSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: { type: Number, required: true },
  voice: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  language: { type: String, enum: ['en', 'vi'], required: true },
  mode: { type: String, enum: ['casual-chat', 'speaking-practice', 'interview'], required: true },
})

// Main Conversation Schema
const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  timestamp: { type: Date, required: true },
  messages: [MessageSchema],
  config: { type: ConversationConfigSchema, required: true },
  callEnded: { type: Boolean, default: false },
  timeRemaining: { type: Number, default: 0 },
  analysis: { type: mongoose.Schema.Types.Mixed },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Create model safely
let ConversationModel: any = null

export function getConversationModel() {
  if (!isConnected && !process.env.MONGODB_URI) {
    return null
  }
  
  if (!ConversationModel) {
    try {
      ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)
    } catch (error) {
      console.error('[v0] Error creating Conversation model:', error)
      return null
    }
  }
  
  return ConversationModel
}

export const Conversation = getConversationModel()

// Database operations
export class ConversationService {
  
  static async saveConversation(conversation: any) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - skipping save')
      return null
    }

    try {
      await connectMongoDB()
      
      const existingConversation = await Conversation.findOne({ id: conversation.id })
      
      if (existingConversation) {
        Object.assign(existingConversation, conversation)
        return await existingConversation.save()
      } else {
        const newConversation = new Conversation(conversation)
        return await newConversation.save()
      }
    } catch (error) {
      console.error('[v0] Error saving conversation:', error)
      return null
    }
  }

  static async getConversationById(id: string) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - returning null')
      return null
    }

    try {
      await connectMongoDB()
      return await Conversation.findOne({ id })
    } catch (error) {
      console.error('[v0] Error getting conversation:', error)
      return null
    }
  }

  static async getConversationHistory(userId?: string, limit: number = 50) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - returning empty array')
      return []
    }

    try {
      await connectMongoDB()
      
      const query = userId ? { userId } : {}
      
      return await Conversation.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } catch (error) {
      console.error('[v0] Error getting conversation history:', error)
      return []
    }
  }

  static async deleteConversation(id: string) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - skipping delete')
      return null
    }

    try {
      await connectMongoDB()
      return await Conversation.deleteOne({ id })
    } catch (error) {
      console.error('[v0] Error deleting conversation:', error)
      return null
    }
  }

  static async clearAllConversations(userId?: string) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - skipping clear')
      return null
    }

    try {
      await connectMongoDB()
      
      const query = userId ? { userId } : {}
      return await Conversation.deleteMany(query)
    } catch (error) {
      console.error('[v0] Error clearing conversations:', error)
      return null
    }
  }

  static async updateConversationAnalysis(id: string, analysis: any) {
    const Conversation = getConversationModel()
    if (!Conversation) {
      console.warn('[v0] MongoDB not available - skipping analysis update')
      return null
    }

    try {
      await connectMongoDB()
      
      return await Conversation.findOneAndUpdate(
        { id },
        { analysis, updatedAt: new Date() },
        { new: true }
      )
    } catch (error) {
      console.error('[v0] Error updating conversation analysis:', error)
      return null
    }
  }
}
