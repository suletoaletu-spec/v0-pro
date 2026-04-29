"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Activity, Globe as GlobeIcon, AlertTriangle, Zap, Wifi, Users, Leaf, DollarSign, BarChart3, Share2 } from "lucide-react"

// Simple helper for styling
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ")

export default function Dashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [logs, setLogs] = useState<string[]>([
    "SATELLITE LINK ESTABLISHED",
    "SCANNING GLOBAL SECTORS...",
    "RESOURCE BUFFER OPTIMIZED",
  ])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleGlobeClick = () => {
    const lat = (Math.random() * 180 - 90).toFixed(2)
    const lng = (Math.random() * 360 - 180).toFixed(2)
    setLogs(prev => [`ALERT DISPATCHED: [${lat}, ${lng}]`, ...prev].slice(0, 5))
    alert(`Planetary Alert Sent: Location [${lat}, ${lng}]`)
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/40 text-cyan-400 font-bold text-xl">P</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Planetary Resource Network</h1>
              <p className="text-xs text-white/40 font-mono">SYSTEMS_NOMINAL // 247_NODES_ACTIVE</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <Leaf className="w-3 h-3" /> HELPING WORLDWIDE
            </button>
            <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs rounded-lg flex items-center gap-2">
              <Share2 className="w-3 h-3" /> INVITE OTHERS
            </button>
          </div>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<Users className="text-cyan-400"/>} title="Lives Impacted" value="12.4M" sub="vs. last month" trend="+18.5%" color="cyan" />
          <MetricCard icon={<BarChart3 className="text-amber-400"/>} title="Tons of Waste Saved" value="45.2K" sub="prevented from landfills" trend="+12.3%" color="amber" />
          <MetricCard icon={<Leaf className="text-emerald-400"/>} title="Carbon Savings" value="8.5K" sub="offset this quarter" trend="+24.7%" color="emerald" />
          <MetricCard icon={<DollarSign className="text-yellow-500"/>} title="Economic Value" value="$2.5B" sub="total value created" trend="+31.2%" color="yellow" />
        </div>

        {/* CENTER SECTION: GLOBE & INTEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* INTEL FEED */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
              <Activity className="w-4 h-4 animate-pulse" /> SYSTEM_INTEL_FEED
            </div>
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="text-[11px] font-mono text-white/50 border-l-2 border-cyan-500/20 pl-3 py-1">
                  {log}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5 text-[10px] text-white/20 font-mono">
              LAST_SYNC: {currentTime.toLocaleTimeString()}
            </div>
          </div>

          {/* GLOBE DISPLAY */}
          <div className="lg:col-span-2 relative bg-zinc-900/20 border border-white/10 rounded-3xl overflow-hidden h-[500px] flex items-center justify-center cursor-crosshair group" onClick={handleGlobeClick}>
            <div className="absolute top-6 right-6 z-20">
              <div className="bg-cyan-500/10 border border-cyan-500/40 p-3 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase italic">
                  <Shield className="w-3 h-3" /> Manual Override: Active
                </div>
              </div>
            </div>
            
            <div className="relative transform group-hover:scale-105 transition-transform duration-700">
               <GlobeIcon className="w-64 h-64 text-cyan-500/20 animate-pulse" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-60 h-60 rounded-full border border-dashed border-white/10 animate-[spin_20s_linear_infinite_reverse]" />
               </div>
            </div>

            <div className="absolute bottom-6 flex gap-8 text-[10px] text-white/30 uppercase tracking-widest font-mono">
              <span className="flex items-center gap-2"><Wifi className="w-3 h-3 text-emerald-500"/> Uplink Stable</span>
              <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500"/> Power Nominal</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

function MetricCard({ icon, title, value, sub, trend, color }: any) {
  const colors: any = {
    cyan: "border-cyan-500/20 bg-cyan-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    yellow: "border-yellow-500/20 bg-yellow-500/5"
  }
  
  return (
    <div className={cn("p-6 rounded-3xl border transition-all hover:border-white/20", colors[color])}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <div className="text-[10px] font-bold text-emerald-400 font-mono">{trend}</div>
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{title}</h3>
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <p className="text-[10px] text-white/30 italic">{sub}</p>
      </div>
    </div>
  )
}
