"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Activity, Globe as GlobeIcon, AlertTriangle, Zap, Wifi } from "lucide-react"

// Simple helper to replace the missing utility file
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ")

export default function Dashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [logs, setLogs] = useState<string[]>([
    "SATELLITE LINK ESTABLISHED",
    "SCANNING GLOBAL SECTORS...",
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (Math.random() > 0.8) {
        const fakeLogs = ["ATMOSPHERIC DATA SYNCED", "RESOURCE BUFFER OPTIMIZED", "SIGNAL STRENGTH: 98%"]
        const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)]
        setLogs(prev => [randomLog, ...prev].slice(0, 5))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleGlobeClick = () => {
    const lat = (Math.random() * 180 - 90).toFixed(2)
    const lng = (Math.random() * 360 - 180).toFixed(2)
    setLogs(prev => [`ALERT DISPATCHED: [${lat}, ${lng}]`, ...prev])
    alert(`Global Intel Alert Sent for Location: ${lat}, ${lng}`)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let animationId: number
    let rotation = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    const drawGlobe = () => {
      const rect = canvas.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const radius = Math.min(centerX, centerY) * 0.7
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.stroke()
      rotation += 0.002
      animationId = requestAnimationFrame(drawGlobe)
    }
    drawGlobe()
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-4 font-mono">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN: STATUS */}
        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-cyan-400 mb-4 text-xs">
              <Activity className="w-4 h-4 animate-pulse" />
              SYSTEM_INTEL_FEED
            </div>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] text-white/50 border-l border-cyan-500/30 pl-2">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: THE GLOBE */}
        <div className="md:col-span-2 relative bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden h-[600px] flex items-center justify-center">
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-cyan-500/10 border border-cyan-500/40 p-4 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 italic">
                <Shield className="w-4 h-4" /> MANUAL_OVERRIDE_ACTIVE
              </div>
            </div>
          </div>

          <div className="relative w-full h-full flex items-center justify-center cursor-crosshair" onClick={handleGlobeClick}>
            <canvas ref={canvasRef} className="w-full h-full max-w-[500px] max-h-[500px]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <GlobeIcon className="w-64 h-64 text-cyan-500" />
            </div>
          </div>

          <div className="absolute bottom-6 w-full flex justify-center gap-12 text-[10px] text-white/40">
            <div className="flex items-center gap-2"><Wifi className="w-3 h-3"/> UPLINK_STABLE</div>
            <div className="flex items-center gap-2"><Zap className="w-3 h-3"/> POWER_NOMINAL</div>
          </div>
        </div>

      </div>
    </main>
  )
}
