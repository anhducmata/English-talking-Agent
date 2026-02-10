"use client"

import { useEffect, useState } from "react"

function useCurrentTime() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}

function PulsingDot({ className }: { className?: string }) {
  return (
    <span className={`relative flex h-2.5 w-2.5 ${className ?? ""}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground/70" />
    </span>
  )
}

function GlowEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Central glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.02] blur-[120px]" />
      {/* Top-right subtle glow */}
      <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-foreground/[0.015] blur-[100px]" />
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function MaintenancePage() {
  const time = useCurrentTime()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sf-mono text-foreground">
      <GlowEffect />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute animate-float1 opacity-[0.08]">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
        </div>
        <div className="absolute animate-float2 opacity-[0.06]">
          <div className="h-1 w-1 rounded-full bg-foreground" />
        </div>
        <div className="absolute animate-float3 opacity-[0.1]">
          <div className="h-2 w-2 rounded-full bg-foreground" />
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 flex w-full max-w-2xl flex-col items-center gap-16 transition-all duration-1000 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Top status bar */}
        <div className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Simple Talk</span>
          <span>{time || "\u00A0"}</span>
        </div>

        {/* Central block */}
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Logo / Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
              Under Maintenance
            </h1>
          </div>

          {/* Description */}
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            We are upgrading Simple Talk to the Realtime Voice API for faster,
            more natural conversations. The system will be back online shortly.
          </p>

          {/* Animated progress indicator */}
          <div className="flex items-center gap-3">
            <PulsingDot />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Upgrade in progress
            </span>
          </div>
        </div>

        {/* Info cards row */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Left card - System Info */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              System
            </span>
            <div className="flex flex-col gap-2">
              <StatusRow label="Status" value="Maintenance" />
              <StatusRow label="Mode" value="Realtime Voice" />
              <StatusRow label="Engine" value="WebRTC" />
            </div>
          </div>

          {/* Right card - Service Info */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              What's new
            </span>
            <div className="flex flex-col gap-2">
              <StatusRow label="Latency" value="< 300ms" />
              <StatusRow label="Voice" value="Real-time" />
              <StatusRow label="Quality" value="HD Audio" />
            </div>
          </div>
        </div>

        {/* Bottom divider and footer */}
        <div className="flex w-full flex-col items-center gap-4">
          <div className="h-px w-full bg-border" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Practice English with AI &mdash; Returning soon
          </p>
        </div>
      </div>
    </div>
  )
}
