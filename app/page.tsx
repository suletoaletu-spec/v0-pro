"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Zap, Share2, Globe, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-black/20 font-mono text-primary animate-pulse uppercase">Syncing Global Data...</div>
  }
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"globe" | "alerts" | "authorization" | "water">("globe")

  return (
    <div className="min-h-screen bg-[#000000] text-foreground font-sans selection:bg-primary/30">
      <Header />
      
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* GLOBAL MISSION BANNER */}
        <div className="mb-6 p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Globe className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">Planetary Resource Network</h1>
              <p className="text-xs text-muted-foreground">Global coordination for a sustainable future.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <Heart className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-mono text-green-500 font-bold uppercase tracking-widest">Helping Worldwide</span>
             </div>
             <button 
              onClick={() => navigator.share?.({ title: 'Join the PRO Network', url: window.location.href })}
              className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary transition-all flex items-center gap-2"
            >
              <Share2 className="w-3 h-3" /> INVITE OTHERS
            </button>
          </div>
        </div>

        <section className="mb-6"><EnhancedMetrics /></section>

        {/* Universal Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "globe", label: "Live Globe", icon: Globe2 },
            { id: "alerts", label: "Crisis Alerts", icon: AlertTriangle },
            { id: "water", label: "Resource Trade", icon: Zap },
            { id: "authorization", label: "Global Action", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-mono transition-all border shrink-0 uppercase font-bold",
                activeTab === tab.id ? "bg-primary text-black border-primary shadow-xl shadow-primary/20" : "bg-[#0A0A0A] text-muted-foreground border-white/5 hover:border-white/20"
              )}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Public News Feed */}
          <aside className="lg:col-span-3 order-2 lg:order-1 h-[580px] rounded-3xl border border-white/5 bg-[#050505] p-5 shadow-2xl overflow-hidden">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Global Live Feed</div>
            <AgentFeed />
          </aside>

          {/* Interactive Globe Section */}
          <section className="lg:col-span-9 order-1 lg:order-2 h-[580px] rounded-3xl border border-white/5 bg-[#030303] relative overflow-hidden shadow-2xl">
            {activeTab === "globe" && (
              <div className="w-full h-full relative">
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-primary font-mono uppercase font-black">Network Status</p>
                    <p className="text-[9px] text-white/60 font-mono">Real-time planetary data stream active.</p>
                  </div>
                </div>
                <ThreeGlobe />
              </div>
            )}
            {activeTab === "alerts" && <div className="p-8 h-full overflow-auto"><ShortageAlerts /></div>}
            {activeTab === "water" && <div className="p-8 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
            {activeTab === "authorization" && (
              <div className="p-12 h-full flex flex-col items-center justify-center text-center space-y-6">
                <Shield className="w-20 h-20 text-primary mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Global Action Center</h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">This portal coordinates humanitarian aid and resource transfers across borders. Together, we can solve the world's most pressing shortages.</p>
                <div className="flex gap-4">
                  <button className="bg-primary/20 text-primary border border-primary/40 px-6 py-2 rounded-xl text-xs font-bold uppercase">View Active Missions</button>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 py-6 text-center border-t border-white/5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.5em] opacity-50 italic">Empowering Humanity Through Intelligent Resource Management</p>
        </footer>
      </main>
    </div>
  )
}
