import mongoose from 'mongoose'

// Connection
let isConnected = false

export async function connectMongoDB() {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    isConnected = true
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Message Schema
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  audioS3Key: { type: String }, // S3 key for audio file
  audioUrl: { type: String }, // Public S3 URL (if any)
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
  userId: { type: String }, // For future user authentication
  timestamp: { type: Date, required: true },
  messages: [MessageSchema],
  config: { type: ConversationConfigSchema, required: true },
  callEnded: { type: Boolean, default: false },
  timeRemaining: { type: Number, default: 0 },
  analysis: { type: mongoose.Schema.Types.Mixed }, // Store analysis results
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)

// Database operations
export class ConversationService {
  
  static async saveConversation(conversation: any) {
    await connectMongoDB()
    
    const existingConversation = await Conversation.findOne({ id: conversation.id })
    
    if (existingConversation) {
      // Update existing conversation
      Object.assign(existingConversation, conversation)
      return await existingConversation.save()
    } else {
      // Create new conversation
      const newConversation = new Conversation(conversation)
      return await newConversation.save()
    }
  }

  static async getConversationById(id: string) {
    await connectMongoDB()
    return await Conversation.findOne({ id })
  }

  static async getConversationHistory(userId?: string, limit: number = 50) {
    await connectMongoDB()
    
    const query = userId ? { userId } : {}
    
    return await Conversation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  static async deleteConversation(id: string) {
    await connectMongoDB()
    return await Conversation.deleteOne({ id })
  }

  static async clearAllConversations(userId?: string) {
    await connectMongoDB()
    
    const query = userId ? { userId } : {}
    return await Conversation.deleteMany(query)
  }

  static async updateConversationAnalysis(id: string, analysis: any) {
    await connectMongoDB()
    
    return await Conversation.findOneAndUpdate(
      { id },
      { analysis, updatedAt: new Date() },
      { new: true }
    )
  }
}
