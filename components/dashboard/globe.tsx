"use client"

import { useEffect, useRef } from "react"

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.8,
        centerX,
        centerY,
        radius * 1.4
      )
      glowGradient.addColorStop(0, "rgba(0, 220, 220, 0.15)")
      glowGradient.addColorStop(0.5, "rgba(0, 220, 220, 0.05)")
      glowGradient.addColorStop(1, "transparent")
      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Globe base
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius
      )
      gradient.addColorStop(0, "rgba(30, 35, 50, 1)")
      gradient.addColorStop(0.7, "rgba(15, 18, 28, 1)")
      gradient.addColorStop(1, "rgba(8, 10, 18, 1)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Globe border
      ctx.strokeStyle = "rgba(0, 220, 220, 0.4)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Grid lines (latitude)
      ctx.strokeStyle = "rgba(0, 220, 220, 0.15)"
      ctx.lineWidth = 1
      for (let i = 1; i < 6; i++) {
        const lat = (i / 6) * Math.PI - Math.PI / 2
        const y = centerY + Math.sin(lat) * radius
        const w = Math.cos(lat) * radius

        ctx.beginPath()
        ctx.ellipse(centerX, y, w, w * 0.1, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Grid lines (longitude)
      for (let i = 0; i < 12; i++) {
        const lon = (i / 12) * Math.PI * 2 + rotation
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(lon)

        ctx.beginPath()
        ctx.ellipse(0, 0, radius * 0.1, radius, 0, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(0, 220, 220, 0.1)"
        ctx.stroke()
        ctx.restore()
      }

      // Resource flow lines
      const flowLines = [
        { start: -30, end: 45, offset: 0 },
        { start: 60, end: -20, offset: 0.3 },
        { start: -60, end: 30, offset: 0.6 },
        { start: 120, end: -45, offset: 0.15 },
        { start: -90, end: 80, offset: 0.45 },
        { start: 150, end: -10, offset: 0.75 },
      ]

      flowLines.forEach((flow, index) => {
        const progress = ((Date.now() / 3000 + flow.offset) % 1)
        const startAngle = (flow.start * Math.PI) / 180 + rotation
        const endAngle = (flow.end * Math.PI) / 180 + rotation

        const startX = centerX + Math.cos(startAngle) * radius * 0.9
        const startY = centerY + Math.sin(startAngle) * radius * 0.5
        const endX = centerX + Math.cos(endAngle) * radius * 0.9
        const endY = centerY + Math.sin(endAngle) * radius * 0.5

        const cpX = centerX + (Math.random() - 0.5) * radius * 0.5
        const cpY = centerY - radius * 0.6

        const flowGradient = ctx.createLinearGradient(startX, startY, endX, endY)
        const isGold = index % 2 === 0
        const color = isGold ? "rgba(255, 200, 50," : "rgba(0, 220, 220,"

        flowGradient.addColorStop(Math.max(0, progress - 0.2), `${color} 0)`)
        flowGradient.addColorStop(progress, `${color} 0.8)`)
        flowGradient.addColorStop(Math.min(1, progress + 0.2), `${color} 0)`)

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(cpX, cpY, endX, endY)
        ctx.strokeStyle = flowGradient
        ctx.lineWidth = 2
        ctx.stroke()

        // Animated particle
        const t = progress
        const particleX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX
        const particleY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY

        ctx.beginPath()
        ctx.arc(particleX, particleY, 4, 0, Math.PI * 2)
        ctx.fillStyle = isGold ? "rgba(255, 200, 50, 1)" : "rgba(0, 220, 220, 1)"
        ctx.fill()

        // Particle glow
        const particleGlow = ctx.createRadialGradient(
          particleX,
          particleY,
          0,
          particleX,
          particleY,
          12
        )
        particleGlow.addColorStop(0, isGold ? "rgba(255, 200, 50, 0.5)" : "rgba(0, 220, 220, 0.5)")
        particleGlow.addColorStop(1, "transparent")
        ctx.fillStyle = particleGlow
        ctx.fillRect(particleX - 12, particleY - 12, 24, 24)
      })

      // Center dot
      ctx.beginPath()
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 220, 220, 1)"
      ctx.fill()

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
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth: "400px", maxHeight: "400px" }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs font-mono text-primary/60 tracking-widest">ORBITAL VIEW</div>
        </div>
      </div>
    </div>
  )
}
{/* OVERLAY HUD */}
<div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
  <div className="bg-primary/10 border border-primary/40 backdrop-blur-md p-3 rounded-xl animate-pulse">
    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase italic">
      <Shield className="w-3 h-3" /> Manual Override: Active
    </div>
    <p className="text-[9px] text-white/70 font-mono mt-1">CLICK GLOBE TO RELEASE RESOURCES</p>
  </div>

  {/* Recent Manual Missions List */}
  {activeMissions.length > 0 && (
    <div className="bg-black/80 border border-white/10 p-3 rounded-xl max-h-[150px] overflow-y-auto">
      <p className="text-[8px] text-muted-foreground uppercase mb-2">Override Logs</p>
      {activeMissions.map(m => (
        <div key={m.id} className="text-[9px] font-mono text-green-400 border-l border-green-500 pl-2 mb-2">
          {m.timestamp}: AID DEPLOYED [{m.lat.toFixed(2)}, {m.lng.toFixed(2)}]
        </div>
      ))}
    </div>
  )}
</div>
const handleManualSupport = async (lat: number, lng: number) => {
  // 1. Create the UI log
  const newMission = { id: Date.now(), lat, lng, timestamp: new Date().toLocaleTimeString() };
  setActiveMissions(prev => [newMission, ...prev]);

  // 2. AUTOMATIC REAL-WORLD DISPATCH
  // This sends a real alert to your partner email/phone
  await dispatchFreeSupport({ lat, lng });

  // 3. UI Feedback
  toast.success("HUMANITARIAN PARTNERS NOTIFIED", {
    description: `Support protocol active for coord: ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    style: { background: '#000', border: '1px solid #00ff41', color: '#00ff41' }
  });
};

