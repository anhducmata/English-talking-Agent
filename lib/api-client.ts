import { cacheManager } from "./cache-manager"

interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: any
  cache?: boolean
  cacheTTL?: number
  retries?: number
  timeout?: number
}

interface ApiResponse<T> {
  data: T
  cached: boolean
  timestamp: number
}

class ApiClient {
  private baseURL: string
  private defaultConfig: ApiRequestConfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    retries: 3,
    timeout: 10000, // 10 seconds
  }

  constructor(baseURL = "") {
    this.baseURL = baseURL
  }

  private generateCacheKey(url: string, config: ApiRequestConfig): string {
    const method = config.method || "GET"
    const body = config.body ? JSON.stringify(config.body) : ""
    return `${method}:${url}:${body}`
  }

  private async fetchWithTimeout(url: string, config: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async retryRequest<T>(url: string, config: ApiRequestConfig, attempt = 1): Promise<ApiResponse<T>> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config }
      const fullUrl = `${this.baseURL}${url}`

      // Check cache first for GET requests
      if (finalConfig.method === "GET" && finalConfig.cache) {
        const cacheKey = this.generateCacheKey(url, finalConfig)
        const cachedData = cacheManager.get<T>(cacheKey)

        if (cachedData) {
          return {
            data: cachedData,
            cached: true,
            timestamp: Date.now(),
          }
        }
      }

      const requestConfig: RequestInit = {
        method: finalConfig.method,
        headers: finalConfig.headers,
        body: finalConfig.body ? JSON.stringify(finalConfig.body) : undefined,
      }

      const response = await this.fetchWithTimeout(fullUrl, requestConfig, finalConfig.timeout!)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful GET responses
      if (finalConfig.method === "GET" && finalConfig.cache) {
        const cacheKey = this.generateCacheKey(url, finalConfig)
        cacheManager.set(cacheKey, data, { ttl: finalConfig.cacheTTL! })
      }

      return {
        data,
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      if (attempt < (config.retries || this.defaultConfig.retries!)) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.retryRequest<T>(url, config, attempt + 1)
      }
      throw error
    }
  }

  async get<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(url, { ...config, method: "GET" })
  }

  async post<T>(url: string, body?: any, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(url, { ...config, method: "POST", body, cache: false })
  }

  async put<T>(url: string, body?: any, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(url, { ...config, method: "PUT", body, cache: false })
  }

  async delete<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(url, { ...config, method: "DELETE", cache: false })
  }

  // Prefetch data
  async prefetch<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<void> {
    try {
      await this.get<T>(url, config)
    } catch (error) {
      console.warn(`Prefetch failed for ${url}:`, error)
    }
  }

  // Invalidate cache
  invalidateCache(url: string, config?: ApiRequestConfig): void {
    const cacheKey = this.generateCacheKey(url, config || {})
    cacheManager.delete(cacheKey)
  }

  // Clear all cache
  clearCache(): void {
    cacheManager.clear()
  }
}

export const apiClient = new ApiClient()
