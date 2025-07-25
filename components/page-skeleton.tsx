"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Flying Character Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -left-1 -right-1 top-3 h-0.5 bg-white rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
      </div>

      {/* Top Navigation Skeleton */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-16 bg-gray-800" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-8 bg-gray-800" />
          <Skeleton className="h-6 w-8 bg-gray-800" />
        </div>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-32 mx-auto bg-gray-800" />
          <Skeleton className="h-4 w-64 mx-auto bg-gray-800" />
        </div>

        {/* Start Practice Button Skeleton */}
        <div className="w-full">
          <Skeleton className="w-full h-10 bg-gray-800 rounded-lg" />
        </div>

        {/* Practice Style Selection Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 mx-auto bg-gray-800" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-600 bg-gray-800">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="relative">
                    <Skeleton className="w-10 h-10 rounded-full mx-auto bg-gray-700" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mx-auto mb-1 bg-gray-700" />
                    <Skeleton className="h-3 w-32 mx-auto bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Skeleton className="h-12 w-full mx-auto bg-gray-800" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fly1 {
          0% { transform: translate(-100px, 20vh) rotate(0deg); }
          25% { transform: translate(25vw, 10vh) rotate(90deg); }
          50% { transform: translate(50vw, 30vh) rotate(180deg); }
          75% { transform: translate(75vw, 15vh) rotate(270deg); }
          100% { transform: translate(calc(100vw + 100px), 25vh) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export function HistoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="container mx-auto px-6 py-6 max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 bg-gray-800" />
            <Skeleton className="h-8 w-48 bg-gray-800" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-8 bg-gray-800" />
            <Skeleton className="h-6 w-8 bg-gray-800" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-24 mx-auto bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversation List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-64 mb-2 bg-gray-700" />
                    <div className="flex items-center space-x-4 text-sm">
                      <Skeleton className="h-4 w-20 bg-gray-700" />
                      <Skeleton className="h-4 w-16 bg-gray-700" />
                      <Skeleton className="h-4 w-24 bg-gray-700" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                    <Skeleton className="h-8 w-8 bg-gray-700" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fly1 {
          0% { transform: translate(-100px, 20vh) rotate(0deg); }
          100% { transform: translate(calc(100vw + 100px), 25vh) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export function PracticePageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 bg-gray-800" />
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-16 bg-gray-800" />
            <Skeleton className="h-8 w-20 bg-gray-800" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-8 bg-gray-800" />
              <Skeleton className="h-6 w-8 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-6 max-w-6xl relative z-10">
        <div className="text-center space-y-6">
          {/* Topic and Settings */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mx-auto bg-gray-800" />
            <div className="flex justify-center space-x-6">
              <Skeleton className="h-4 w-20 bg-gray-800" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-4 w-16 bg-gray-800" />
            </div>
          </div>

          {/* Mode Selector Skeleton */}
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-32 bg-gray-800 rounded-lg" />
            ))}
          </div>

          {/* Start Call Button */}
          <Skeleton className="h-12 w-48 mx-auto bg-gray-800 rounded-lg" />

          {/* Additional Info */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-96 mx-auto bg-gray-800" />
            <Skeleton className="h-4 w-80 mx-auto bg-gray-800" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fly1 {
          0% { transform: translate(-100px, 20vh) rotate(0deg); }
          100% { transform: translate(calc(100vw + 100px), 25vh) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
