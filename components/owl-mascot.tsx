"use client"

import { useEffect, useState } from "react"

export type OwlState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'celebrating' 
  | 'waving'
  | 'sleeping'

interface OwlMascotProps {
  state?: OwlState
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showSpeechBubble?: boolean
  speechText?: string
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
}

export function OwlMascot({
  state = 'idle',
  size = 'md',
  className = '',
  showSpeechBubble = false,
  speechText = '',
}: OwlMascotProps) {
  const [blinking, setBlinking] = useState(false)

  // Random blinking effect
  useEffect(() => {
    if (state === 'sleeping') return
    
    const blinkInterval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 150)
    }, 3000 + Math.random() * 2000)

    return () => clearInterval(blinkInterval)
  }, [state])

  // Animation classes based on state
  const getAnimationClass = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse'
      case 'thinking':
        return 'animate-bounce-gentle'
      case 'speaking':
        return 'animate-wiggle'
      case 'celebrating':
        return 'animate-celebrate'
      case 'waving':
        return 'animate-wiggle'
      case 'sleeping':
        return ''
      default:
        return ''
    }
  }

  // Eye expressions based on state
  const getEyeClass = () => {
    if (blinking || state === 'sleeping') return 'scale-y-[0.1]'
    if (state === 'celebrating') return 'scale-110'
    if (state === 'listening') return 'scale-105'
    return ''
  }

  // Pupil animation based on state
  const getPupilOffset = () => {
    switch (state) {
      case 'listening':
        return 'translate-y-[-2px]'
      case 'thinking':
        return 'translate-x-[3px] translate-y-[-1px]'
      case 'speaking':
        return ''
      default:
        return ''
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-primary/20 max-w-[200px] z-10">
          <p className="text-sm text-foreground text-center font-medium">{speechText}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-primary/20 rotate-45" />
        </div>
      )}

      {/* Owl SVG */}
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size]} ${getAnimationClass()} transition-transform duration-300`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background glow for active states */}
        {(state === 'listening' || state === 'speaking') && (
          <circle
            cx="50"
            cy="50"
            r="48"
            className="fill-primary/10 animate-pulse"
          />
        )}

        {/* Body */}
        <ellipse
          cx="50"
          cy="60"
          rx="35"
          ry="38"
          className="fill-amber-600"
        />

        {/* Belly */}
        <ellipse
          cx="50"
          cy="70"
          rx="22"
          ry="25"
          className="fill-amber-100"
        />

        {/* Belly pattern (stripes) */}
        <path
          d="M35 60 Q50 65 65 60"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="stroke-amber-300"
        />
        <path
          d="M33 68 Q50 73 67 68"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="stroke-amber-300"
        />
        <path
          d="M35 76 Q50 81 65 76"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="stroke-amber-300"
        />

        {/* Head */}
        <circle
          cx="50"
          cy="35"
          r="28"
          className="fill-amber-600"
        />

        {/* Ear tufts */}
        <path
          d="M25 18 L30 28 L22 28 Z"
          className="fill-amber-700"
        />
        <path
          d="M75 18 L70 28 L78 28 Z"
          className="fill-amber-700"
        />

        {/* Face disc (lighter area around eyes) */}
        <ellipse
          cx="38"
          cy="35"
          rx="14"
          ry="15"
          className="fill-amber-100"
        />
        <ellipse
          cx="62"
          cy="35"
          rx="14"
          ry="15"
          className="fill-amber-100"
        />

        {/* Eyes */}
        <g className={`transition-transform duration-150 origin-center ${getEyeClass()}`}>
          {/* Left eye */}
          <circle
            cx="38"
            cy="35"
            r="10"
            className="fill-white"
          />
          <circle
            cx="38"
            cy="35"
            r="6"
            className={`fill-amber-900 transition-transform duration-200 ${getPupilOffset()}`}
          />
          <circle
            cx="36"
            cy="33"
            r="2"
            className="fill-white"
          />

          {/* Right eye */}
          <circle
            cx="62"
            cy="35"
            r="10"
            className="fill-white"
          />
          <circle
            cx="62"
            cy="35"
            r="6"
            className={`fill-amber-900 transition-transform duration-200 ${getPupilOffset()}`}
          />
          <circle
            cx="60"
            cy="33"
            r="2"
            className="fill-white"
          />
        </g>

        {/* Beak */}
        <path
          d="M50 42 L45 50 L50 48 L55 50 Z"
          className="fill-orange-400"
        />

        {/* Wings */}
        <ellipse
          cx="20"
          cy="60"
          rx="8"
          ry="20"
          className={`fill-amber-700 origin-top transition-transform duration-300 ${
            state === 'waving' ? 'rotate-[-20deg]' : ''
          }`}
        />
        <ellipse
          cx="80"
          cy="60"
          rx="8"
          ry="20"
          className="fill-amber-700"
        />

        {/* Feet */}
        <ellipse cx="40" cy="95" rx="8" ry="4" className="fill-orange-400" />
        <ellipse cx="60" cy="95" rx="8" ry="4" className="fill-orange-400" />

        {/* Graduation cap for speaking/teaching state */}
        {state === 'speaking' && (
          <g>
            <rect x="30" y="5" width="40" height="4" className="fill-gray-800" />
            <polygon points="50,0 30,8 50,16 70,8" className="fill-gray-700" />
            <line x1="65" y1="8" x2="72" y2="18" stroke="currentColor" strokeWidth="1" className="stroke-gray-800" />
            <circle cx="72" cy="20" r="3" className="fill-yellow-400" />
          </g>
        )}

        {/* Headphones for listening state */}
        {state === 'listening' && (
          <g>
            <path
              d="M22 35 Q22 15 50 12 Q78 15 78 35"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="stroke-gray-700"
            />
            <rect x="16" y="30" width="10" height="15" rx="3" className="fill-gray-600" />
            <rect x="74" y="30" width="10" height="15" rx="3" className="fill-gray-600" />
          </g>
        )}

        {/* Z's for sleeping */}
        {state === 'sleeping' && (
          <g className="animate-pulse">
            <text x="70" y="20" className="fill-primary text-[10px] font-bold">Z</text>
            <text x="78" y="12" className="fill-primary text-[8px] font-bold">z</text>
            <text x="84" y="6" className="fill-primary text-[6px] font-bold">z</text>
          </g>
        )}

        {/* Stars for celebrating */}
        {state === 'celebrating' && (
          <g>
            <polygon
              points="15,15 17,20 22,20 18,24 20,30 15,26 10,30 12,24 8,20 13,20"
              className="fill-yellow-400 animate-pulse"
            />
            <polygon
              points="85,15 87,20 92,20 88,24 90,30 85,26 80,30 82,24 78,20 83,20"
              className="fill-yellow-400 animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
            <polygon
              points="50,0 51,3 54,3 52,5 53,8 50,6 47,8 48,5 46,3 49,3"
              className="fill-yellow-400 animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
          </g>
        )}
      </svg>
    </div>
  )
}
