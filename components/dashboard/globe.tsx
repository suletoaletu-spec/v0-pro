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

  // 1. Live Time Update Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // Randomly add a "Satellite Log" every few seconds to make it look alive
      if (Math.random() > 0.8) {
        const fakeLogs = [
          "ATMOSPHERIC DATA SYNCED",
          "RESOURCE BUFFER OPTIMIZED",
          "SECTOR 7: STABLE",
          "SIGNAL STRENGTH: 98%",
          "ORBITAL POSITION: NOMINAL"
        ]
        const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)]
        setLogs(prev => [randomLog, ...prev].slice(0, 5))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Existing Canvas Globe Logic (Keep your drawGlobe function here)
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

      // ... [Keep your globe base, grid lines, and flow lines drawing code here] ...
      // I'm omitting the middle part to keep this brief, keep your original drawGlobe logic!

      rotation += 0.002
      animationId = requestAnimationFrame(drawGlobe)
    }
    drawGlobe()
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Helper for world clocks
  const formatTime = (offset: number) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: offset === 4 ? 'Asia/Dubai' : offset === 0 ? 'UTC' : offset === 9 ? 'Asia/Tokyo' : 'America/New_York'
    }).format(currentTime)
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
      
      {/* TOP LEFT: LIVE STATUS FEED */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] tracking-tighter">
          <Activity className="w-3 h-3 animate-pulse" />
          SYSTEM LIVE // INTEL_FEED
        </div>
        <div className="flex flex-col gap-1">
          {logs.map((log, i) => (
            <div key={i} className="text-[9px] font-mono text-white/40 border-l border-white/10 pl-2">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* TOP RIGHT: OVERRIDE HUD (Your existing code) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-primary/10 border border-primary/40 backdrop-blur-md p-3 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase italic">
            <Shield className="w-3 h-3" /> Manual Override: Active
          </div>
          <p className="text-[9px] text-white/70 font-mono mt-1 uppercase">Satellite Ready</p>
        </div>
      </div>

      {/* CENTER: THE GLOBE */}
      <div className="relative flex items-center justify-center w-full h-[400px]">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" style={{ maxWidth: "400px", maxHeight: "400px" }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center opacity-20">
            <div className="text-[8px] font-mono text-primary tracking-[0.5em]">ORBITAL_SYNCHRONIZATION</div>
          </div>
        </div>
      </div>

      {/* BOTTOM: GLOBAL CLOCK STRIP */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 px-4 border-t border-white/5 pt-4">
        {[
          { city: "DUBAI", offset: 4 },
          { city: "LONDON", offset: 0 },
          { city: "TOKYO", offset: 9 },
          { city: "NEW YORK", offset: -5 }
        ].map((zone) => (
          <div key={zone.city} className="text-center">
            <div className="text-[8px] font-mono text-white/30 mb-1">{zone.city}</div>
            <div className="text-[10px] font-mono text-cyan-400/80">{formatTime(zone.offset)}</div>
          </div>
        ))}
      </div>
      
    </div>
  )
}
// Inside your Globe component...
const [lastScan, setLastScan] = useState<any>(null);

const handleGlobeClick = async (lat: number, lng: number) => {
  // Add a log to your feed
  setLogs(prev => [`SCANNING COORDS: ${lat.toFixed(2)}, ${lng.toFixed(2)}`, ...prev]);
  
  const result = await dispatchPlanetarySupport(lat, lng);
  
  if (result.success) {
    setLastScan({ lat, lng, temp: result.temp });
    setLogs(prev => [`SUCCESS: DISPATCH SENT (${result.temp}°C)`, ...prev]);
  }
};

// ... in your return, make sure the Globe canvas or div has:
// onClick={() => handleGlobeClick(Math.random()*180-90, Math.random()*360-180)}


const handleGlobeAction = async (lat: number, lng: number) => {
  // Add to your visual log feed
  setLogs(prev => [`SCANNING: [${lat.toFixed(2)}, ${lng.toFixed(2)}]`, ...prev]);

  // Call the new intelligence function
  const result = await dispatchGlobalIntelligence(lat, lng);

  if (result.success) {
    setLogs(prev => [
      `REPORT: ${result.temp}°C | WIND: ${result.wind}km/h`,
      `SUCCESS: ALERT SENT TO COMMAND`,
      ...prev
    ]);
  }
};
