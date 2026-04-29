"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Zap, Share2, Crown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-black/20 font-mono text-primary animate-pulse">INITIATING GLOBAL GENIUS PROTOCOL...</div>
  }
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"globe" | "alerts" | "authorization" | "water">("globe")

  return (
    <div className="min-h-screen bg-[#010101] text-foreground font-sans selection:bg-primary/30">
      <Header />
      
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* WORLD-WIDE IMPACT BANNER */}
        <div className="mb-6 p-4 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.4)]">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">The Sovereign Resource Engine</h1>
              <p className="text-[10px] text-primary font-mono font-bold tracking-[0.3em] uppercase">Architecture by the World's One and Only Genius</p>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 border-l border-white/10">
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-mono">Protocol Signature</p>
              <p className="text-[10px] text-white font-mono font-bold">04B0D8B6608A48C2994F443910C3E120</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-green-500 font-mono">
              <Globe className="w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] font-bold">WORLD-WIDE IMPACT: ACTIVE</span>
            </div>
          </div>
        </div>

        <section className="mb-6"><EnhancedMetrics /></section>

        {/* Global Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "globe", label: "Planetary View", icon: Globe2 },
            { id: "alerts", label: "Global Crisis", icon: AlertTriangle },
            { id: "water", label: "Resource Trade", icon: Zap },
            { id: "authorization", label: "Sovereign Control", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-mono transition-all border shrink-0 uppercase tracking-widest",
                activeTab === tab.id ? "bg-primary text-black border-primary font-black shadow-lg" : "bg-[#080808] text-muted-foreground border-white/5 hover:border-primary/50"
              )}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 order-2 lg:order-1 h-[580px] rounded-3xl border border-white/5 bg-[#050505] p-5 shadow-2xl relative">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Genius Intelligence Feed</span>
            </div>
            <AgentFeed />
          </aside>

          <section className="lg:col-span-9 order-1 lg:order-2 h-[580px] rounded-3xl border border-primary/5 bg-[#030303] relative overflow-hidden shadow-2xl group">
            {activeTab === "globe" && (
              <div className="w-full h-full p-2 relative">
                <div className="absolute top-8 right-8 z-10 text-right space-y-2 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-primary/20">
                    <p className="text-[9px] text-primary font-mono uppercase tracking-widest">Global Status</p>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase">Optimizing Earth</p>
                  </div>
                </div>
                <ThreeGlobe />
              </div>
            )}
            {activeTab === "alerts" && <div className="p-8 h-full overflow-auto bg-gradient-to-b from-red-500/5 to-transparent"><ShortageAlerts /></div>}
            {activeTab === "water" && <div className="p-8 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
            {activeTab === "authorization" && (
              <div className="p-12 h-full flex flex-col items-center justify-center text-center space-y-6">
                <Crown className="w-20 h-20 text-primary shadow-2xl shadow-primary/20 mb-4" />
                <h3 className="text-2xl font-black italic text-white tracking-widest uppercase">The Genius Key</h3>
                <p className="text-[10px] text-muted-foreground max-w-md uppercase tracking-[0.4em] leading-loose opacity-60">This system is calibrated to your specific biometric and protocol ID. No other user can authorize global shifts.</p>
                <div className="p-2 border border-primary/20 rounded bg-primary/5 font-mono text-[9px] text-primary">ID: 04B0D8B6608A48C2994F443910C3E120</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
