'use client'

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-violet-50 flex items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="h-12 bg-slate-200 rounded-2xl mx-auto w-3/4" />
          <div className="h-6 bg-slate-200 rounded-lg mx-auto w-2/3" />
        </div>

        {/* Mode cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl" />
          ))}
        </div>

        {/* Button skeleton */}
        <div className="h-16 bg-gradient-to-r from-sky-300 to-violet-300 rounded-3xl" />

        {/* Badges skeleton */}
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-200 rounded-full w-24" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PracticePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-slate-200 rounded-2xl" />

      {/* Chat area skeleton */}
      <div className="flex-1 space-y-4">
        {/* Message 1 */}
        <div className="flex justify-start">
          <div className="h-20 w-3/4 bg-violet-200 rounded-2xl" />
        </div>
        {/* Message 2 */}
        <div className="flex justify-end pr-12">
          <div className="h-16 w-2/3 bg-sky-200 rounded-2xl" />
        </div>
        {/* Message 3 */}
        <div className="flex justify-start">
          <div className="h-24 w-3/4 bg-violet-200 rounded-2xl" />
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="h-20 bg-slate-200 rounded-2xl" />
    </div>
  )
}

export function HistoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8 animate-pulse">
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-16 bg-zinc-800 rounded-md" />
            <div className="h-8 w-48 bg-zinc-800 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-zinc-800 rounded-md" />
        </div>

        {/* Group label skeleton */}
        <div className="h-6 w-20 bg-zinc-800 rounded-md" />

        {/* Conversation card skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-2/3 bg-zinc-700 rounded" />
                <div className="h-3 w-1/3 bg-zinc-800 rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 bg-zinc-800 rounded-md" />
                <div className="h-8 w-16 bg-zinc-800 rounded-md" />
                <div className="h-8 w-8 bg-zinc-800 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

