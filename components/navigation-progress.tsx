'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function NavigationProgress() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true)
      setProgress(10)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.random() * 30
        })
      }, 100)

      return () => clearInterval(interval)
    }

    // Router events
    const handleStart = () => {
      handleRouteChange()
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setIsVisible(false)
        setProgress(0)
      }, 300)
    }

    // Listen to popstate for back navigation
    window.addEventListener('popstate', handleStart)

    // Note: Next.js 13+ useRouter doesn't have on() method in app router
    // We'll use a MutationObserver to detect page changes
    const observer = new MutationObserver(() => {
      if (isVisible && progress < 100) {
        setProgress(100)
        setTimeout(() => {
          setIsVisible(false)
          setProgress(0)
        }, 300)
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-nextjs-router-focus-state'],
    })

    return () => {
      window.removeEventListener('popstate', handleStart)
      observer.disconnect()
    }
  }, [isVisible, progress])

  return (
    <>
      {isVisible && (
        <div
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 z-[9999] transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow:
              progress < 100
                ? '0 0 10px rgba(59, 130, 246, 0.8)'
                : 'none',
          }}
        />
      )}
    </>
  )
}
