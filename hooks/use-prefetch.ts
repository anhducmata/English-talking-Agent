"use client"

import { useEffect, useRef } from "react"
import { apiClient } from "@/lib/api-client"

interface PrefetchConfig {
  enabled?: boolean
  delay?: number
  dependencies?: any[]
}

export function usePrefetch(urls: string | string[], config: PrefetchConfig = {}) {
  const { enabled = true, delay = 0, dependencies = [] } = config
  const prefetchedRef = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled) return

    const urlArray = Array.isArray(urls) ? urls : [urls]

    const prefetchData = async () => {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      for (const url of urlArray) {
        if (!prefetchedRef.current.has(url)) {
          try {
            await apiClient.prefetch(url)
            prefetchedRef.current.add(url)
          } catch (error) {
            console.warn(`Failed to prefetch ${url}:`, error)
          }
        }
      }
    }

    prefetchData()
  }, [enabled, delay, ...dependencies])

  const invalidatePrefetch = (url?: string) => {
    if (url) {
      prefetchedRef.current.delete(url)
      apiClient.invalidateCache(url)
    } else {
      prefetchedRef.current.clear()
      apiClient.clearCache()
    }
  }

  return { invalidatePrefetch }
}
