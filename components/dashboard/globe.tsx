"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Radio, Activity, Globe as GlobeIcon } from "lucide-react"

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [logs, setLogs] = useState<string[]>([
    "SATELLITE LINK ESTABLISHED",
    "SCANNING GLOBAL SECTORS...",
  ])

  // 1. Live Time & Log Updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (Math.random() > 0.8) {
        const fakeLogs = ["ATMOSPHERIC DATA SYNCED", "RESOURCE BUFFER OPTIMIZED", "SECTOR 7: STABLE", "SIGNAL STRENGTH: 98%"]
        const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)]
        setLogs(prev => [randomLog, ...prev].slice(0, 5))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Click Handler (The Alert you wanted)
  const handleGlobeClick = () => {
    // Simulating coordinates for the effect
    const lat = (Math.random() * 180 - 90).toFixed(2)
    const lng = (Math.random() * 360 - 180).toFixed(2)
    
    setLogs(prev => [`SCANNING COORDS: ${lat}, ${lng}`, ...prev])
    
    // This is the alert you were looking for
    alert(`Support Alert Sent for Location: ${lat}, ${lng}`)
  }

  // 3. Canvas Logic
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

      // Simple Globe Placeholder (Circle)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
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

  const formatTime = (offset: number) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: offset === 4 ? 'Asia/Dubai' : offset === 0 ? 'UTC' : offset === 9 ? 'Asia/Tokyo' : 'America/New_York'
    }).format(currentTime)
  }

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center bg-black rounded-3xl border border-white/5 overflow-hidden">
      
      {/* STATUS FEED */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px]">
          <Activity className="w-3 h-3 animate-pulse" /> SYSTEM LIVE
        </div>
        {logs.map((log, i) => (
          <div key={i} className="text-[9px] font-mono text-white/40 border-l border-white/10 pl-2">{log}</div>
        ))}
      </div>

      {/* OVERRIDE HUD */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-cyan-500/10 border border-cyan-500/40 p-3 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase italic">
            <Shield className="w-3 h-3" /> Manual Override: Active
          </div>
        </div>
      </div>

      {/* THE GLOBE (Clickable) */}
      <div className="relative flex items-center justify-center w-full h-[400px]" onClick={handleGlobeClick}>
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" style={{ maxWidth: "400px", maxHeight: "400px" }} />
      </div>

      {/* BOTTOM CLOCKS */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 px-4 border-t border-white/5 pt-4">
        {[{ city: "DUBAI", offset: 4 }, { city: "LONDON", offset: 0 }, { city: "TOKYO", offset: 9 }].map((zone) => (
          <div key={zone.city} className="text-center">
            <div className="text-[8px] font-mono text-white/30">{zone.city}</div>
            <div className="text-[10px] font-mono text-cyan-400/80">{formatTime(zone.offset)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
