"use client"

import { useEffect, useState } from "react"
import { Activity, Wifi, Clock } from "lucide-react"
import { SecurityStatus } from "./security-status"

export function Header() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      )
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">PRO</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest">
              PLANETARY RESOURCE ORCHESTRATION
            </p>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-mono">SYSTEMS NOMINAL</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="font-mono">247 NODES</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div className="text-right">
            <div className="font-mono text-foreground tabular-nums">{time}</div>
            <div className="text-[10px] text-muted-foreground">{date}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
