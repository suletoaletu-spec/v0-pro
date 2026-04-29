"use client"

import dynamic from "next/dynamic"
import { Suspense, useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Activity, Droplets, Share2, TrendingUp, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-mono text-primary/60 animate-pulse">SYNCING GLOBAL ASSETS...</span>
        </div>
      </div>
    ),
  }
)

type TabType = "globe" | "alerts" | "authorization" | "water"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("globe")

  const tabs = [
    { id: "globe" as const, label: "Live Globe", icon: Globe2 },
    { id: "alerts" as const, label: "Shortage Alerts", icon: AlertTriangle },
    { id: "water" as const, label: "Water Transfers", icon: Droplets },
    { id: "authorization" as const, label: "Admin Console", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-[#030303] text-foreground font-sans selection:bg-primary/30">
      <Header />
      
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Top Status Bar: Eco + Econ */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-[10px] text-green-500 font-mono uppercase font-bold">Ecological Health</p>
                <p className="text-xs text-white/70">Rainforest Moisture: +2.4% vs Prev. Month</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-blue-500 font-mono uppercase font-bold">Economic Efficiency</p>
                <p className="text-xs text-white/70">Resource Wastage reduced by $12.4M today</p>
              </div>
            </div>
            <button 
              onClick={() => navigator.share?.({ title: 'PRO Global Dashboard', url: window.location.href })}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-[10px] font-mono transition-all"
            >
              SHARE LINK
            </button>
          </div>
        </div>

        <section className="mb-6">
          <EnhancedMetrics />
        </section>

        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all border shrink-0",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
                  : "bg-[#111] text-muted-foreground border-white/5 hover:border-primary/50"
              )}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Agent Feed with New Alerts */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="h-[550px] rounded-xl border border-white/5 bg-[#080808] p-4 overflow-hidden shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                 <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">Global AI Intelligence</span>
                 <Activity className="w-3 h-3 text-primary animate-pulse" />
              </div>
              <AgentFeed />
            </div>
          </aside>

          {/* Globe/Content View */}
          <section className="lg:col-span-9 order-1 lg:order-2">
            <div className="h-[550px] rounded-xl border border-white/5 bg-[#080808] relative overflow-hidden shadow-2xl">
              {activeTab === "globe" && (
                <div className="w-full h-full p-2 relative">
                   <div className="absolute top-4 left-4 z-10 space-y-2">
                    <div className="bg-black/80 backdrop-blur-xl p-2 rounded border border-green-500/30 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-green-500 font-bold uppercase">Amazon Rainforest: Monitoring Cloud Seeding</span>
                    </div>
                    <div className="bg-black/80 backdrop-blur-xl p-2 rounded border border-blue-500/30 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-blue-500 font-bold uppercase">Nordic Grid: Exporting Surplus Energy</span>
                    </div>
                  </div>
                  <ThreeGlobe />
                </div>
              )}
              {activeTab === "alerts" && <div className="p-6 h-full overflow-auto"><ShortageAlerts /></div>}
              {activeTab === "water" && <div className="p-6 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
              {activeTab === "authorization" && (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <Shield className="w-12 h-12 text-primary mb-4 opacity-40" />
                  <h3 className="text-lg font-mono font-bold">Resource Command Console</h3>
                  <p className="text-[10px] text-muted-foreground mt-2 max-w-xs uppercase tracking-widest">Authorized Access Only. All transactions recorded on Planetary Ledger.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 py-4 px-6 rounded-xl bg-[#080808] border border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-muted-foreground gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> SYSTEM LIVE</span>
            <span className="opacity-50 uppercase">Session: 0x9F...A3B</span>
          </div>
          <p className="opacity-30 tracking-widest">GLOBAL RESOURCE COORDINATION NETWORK v1.0.5</p>
        </footer>
      </main>
    </div>
  )
}
