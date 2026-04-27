"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Zap, Share2, Globe, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-black/20 font-mono text-primary animate-pulse italic">Connecting to Satellite Stream...</div>
  }
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"globe" | "alerts" | "authorization" | "water">("globe")
  const [liveTime, setLiveTime] = useState("")
  const [isLive, setIsLive] = useState(false)

  // Real-time Clock Sync
  useEffect(() => {
    setIsLive(true)
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#000000] text-foreground font-sans selection:bg-primary/30">
      <Header />
      
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* LIVE SATELLITE STATUS BAR */}
        <div className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
                <Wifi className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-ping" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase italic">Satellite Link: Established</h1>
              <p className="text-[10px] text-primary font-mono font-bold uppercase tracking-tighter">
                Global Sync Time (UTC): {liveTime || "Syncing..."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 px-4 border-l border-white/10">
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground uppercase font-mono">Real-Time Payload</p>
              <p className="text-[11px] text-green-400 font-mono font-bold tracking-widest animate-pulse">256.4 TB/S LIVE DATA</p>
            </div>
            <button 
              onClick={() => navigator.share?.({ title: 'PRO Global Engine', url: window.location.href })}
              className="bg-primary text-black px-5 py-2 rounded-xl text-[10px] font-black hover:scale-105 transition-all flex items-center gap-2"
            >
              <Share2 className="w-3 h-3" /> SHARE ACCESS
            </button>
          </div>
        </div>

        <section className="mb-6"><EnhancedMetrics /></section>

        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "globe", label: "Satellite View", icon: Globe2 },
            { id: "alerts", label: "Live Crisis", icon: AlertTriangle },
            { id: "water", label: "Global Trade", icon: Zap },
            { id: "authorization", label: "Admin Console", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-mono transition-all border shrink-0 uppercase font-black tracking-widest",
                activeTab === tab.id ? "bg-primary text-black border-primary shadow-[0_0_25px_rgba(var(--primary),0.3)]" : "bg-[#080808] text-muted-foreground border-white/5 hover:border-primary/40"
              )}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Intelligence Feed */}
          <aside className="lg:col-span-3 order-2 lg:order-1 h-[580px] rounded-3xl border border-white/5 bg-[#050505] p-5 shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Live Protocol Feed</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <AgentFeed />
          </aside>

          {/* Globe Display */}
          <section className="lg:col-span-9 order-1 lg:order-2 h-[580px] rounded-3xl border border-white/10 bg-gradient-to-b from-black to-[#050505] relative overflow-hidden shadow-2xl">
            {activeTab === "globe" && (
              <div className="w-full h-full p-2 relative">
                <div className="absolute bottom-8 left-8 z-10">
                   <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-primary">
                        <Globe className="w-3 h-3" /> PLANETARY COORDINATES
                      </div>
                      <p className="text-[12px] text-white font-mono font-bold tracking-widest">0.0000° N, 0.0000° E</p>
                      <p className="text-[9px] text-muted-foreground font-mono">Tracking atmospheric density in real-time...</p>
                   </div>
                </div>
                <ThreeGlobe />
              </div>
            )}
            {activeTab === "alerts" && <div className="p-8 h-full overflow-auto"><ShortageAlerts /></div>}
            {activeTab === "water" && <div className="p-8 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
            {activeTab === "authorization" && (
              <div className="p-12 h-full flex flex-col items-center justify-center text-center space-y-4">
                <Shield className="w-16 h-16 text-primary mb-4 opacity-30" />
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">System Authentication Required</h3>
                <p className="text-[11px] text-muted-foreground max-w-xs uppercase leading-loose tracking-widest">Authorization requests are logged via Satellite ID. Manual override disabled for public users.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 py-6 flex flex-col items-center gap-2 border-t border-white/5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.5em] opacity-40">System Core Live | Multi-Satellite Sync: Active</p>
        </footer>
      </main>
    </div>
  )
}
