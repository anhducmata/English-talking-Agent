"use client"

import { useState, useEffect, useCallback } from "react"
import { cacheManager } from "@/lib/cache-manager"
import { getConversationHistory, type ConversationEntry } from "@/lib/conversation-storage"
import { UnifiedStorageService } from "@/lib/unified-storage-service"

const CONVERSATION_CACHE_KEY = "conversation_history"
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes for conversation data

export function useConversationCache() {
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  const loadConversations = useCallback(async () => {
    setLoading(true)

    try {
      // Check cache first
      const cachedData = cacheManager.get<ConversationEntry[]>(CONVERSATION_CACHE_KEY)

      if (cachedData) {
        setConversations(cachedData)
        setLoading(false)
        return cachedData
      }

      // Load from unified storage (cloud or local)
      const data = await UnifiedStorageService.getConversationHistory()

      // Cache the data
      cacheManager.set(CONVERSATION_CACHE_KEY, data, { ttl: CACHE_TTL })

      setConversations(data)
      setLastUpdated(Date.now())
      setLoading(false)

      return data
    } catch (error) {
      console.error("Failed to load conversations:", error)
      // Fallback to local storage
      try {
        const fallbackData = getConversationHistory()
        setConversations(fallbackData)
        setLoading(false)
        return fallbackData
      } catch (fallbackError) {
        console.error("Fallback to local storage also failed:", fallbackError)
        setLoading(false)
        return []
      }
    }
  }, [])

  const invalidateCache = useCallback(() => {
    cacheManager.delete(CONVERSATION_CACHE_KEY)
    loadConversations()
  }, [loadConversations])

  const updateConversationCache = useCallback((updatedConversations: ConversationEntry[]) => {
    setConversations(updatedConversations)
    cacheManager.set(CONVERSATION_CACHE_KEY, updatedConversations, { ttl: CACHE_TTL })
    setLastUpdated(Date.now())
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    loading,
    lastUpdated,
    loadConversations,
    invalidateCache,
    updateConversationCache,
  }
}
