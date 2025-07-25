"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  cached: boolean
}

interface UseApiConfig {
  immediate?: boolean
  cache?: boolean
  cacheTTL?: number
  retries?: number
  dependencies?: any[]
}

export function useApi<T>(url: string | null, config: UseApiConfig = {}) {
  const { immediate = true, cache = true, cacheTTL = 5 * 60 * 1000, retries = 3, dependencies = [] } = config

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    cached: false,
  })

  const execute = useCallback(async () => {
    if (!url) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.get<T>(url, {
        cache,
        cacheTTL,
        retries,
      })

      setState({
        data: response.data,
        loading: false,
        error: null,
        cached: response.cached,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
    }
  }, [url, cache, cacheTTL, retries])

  const mutate = useCallback(async (newData: T) => {
    setState((prev) => ({
      ...prev,
      data: newData,
      cached: false,
    }))
  }, [])

  const invalidate = useCallback(() => {
    if (url) {
      apiClient.invalidateCache(url)
      execute()
    }
  }, [url, execute])

  useEffect(() => {
    if (immediate && url) {
      execute()
    }
  }, [immediate, execute, ...dependencies])

  return {
    ...state,
    execute,
    mutate,
    invalidate,
    refetch: execute,
  }
}
