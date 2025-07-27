import { NextRequest, NextResponse } from 'next/server'
import { CloudStorageService } from '@/lib/cloud-storage-service'

export async function POST(request: NextRequest) {
  try {
    const conversation = await request.json()

    if (!conversation || !conversation.id) {
      return NextResponse.json({ error: 'Invalid conversation data' }, { status: 400 })
    }

    const savedConversation = await CloudStorageService.saveConversation(conversation)
    
    return NextResponse.json({ 
      success: true, 
      conversation: savedConversation 
    })
  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to save conversation' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (conversationId) {
      // Get specific conversation
      const conversation = await CloudStorageService.getConversationById(conversationId)
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      return NextResponse.json({ conversation })
    } else {
      // Get conversation history
      const conversations = await CloudStorageService.getConversationHistory(userId || undefined, limit)
      
      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Error retrieving conversations:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')
    const clearAll = searchParams.get('clearAll') === 'true'
    const userId = searchParams.get('userId')

    if (clearAll) {
      await CloudStorageService.clearAllConversations(userId || undefined)
      return NextResponse.json({ success: true, message: 'All conversations cleared' })
    } else if (conversationId) {
      await CloudStorageService.deleteConversation(conversationId)
      return NextResponse.json({ success: true, message: 'Conversation deleted' })
    } else {
      return NextResponse.json({ error: 'No conversation ID provided' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' }, 
      { status: 500 }
    )
  }
}
