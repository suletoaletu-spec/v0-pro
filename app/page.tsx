"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Activity, Droplets, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-mono text-primary/60 animate-pulse">BOOTING GLOBAL ENGINE...</span>
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
    { id: "alerts" as const, label: "Alerts", icon: AlertTriangle },
    { id: "water" as const, label: "Transfers", icon: Droplets },
    { id: "authorization" as const, label: "Admin", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Header />
      
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Public Welcome Banner */}
        <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-primary uppercase">Public Access Enabled</h1>
            <p className="text-[10px] text-muted-foreground">Monitoring 12,402 global resource nodes in real-time.</p>
          </div>
          <button 
            onClick={() => navigator.share?.({ title: 'PRO Dashboard', url: window.location.href })}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md text-xs font-mono transition-all"
          >
            <Share2 className="w-3 h-3" /> SHARE APP
          </button>
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
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
                  : "bg-secondary/40 text-secondary-foreground border-border hover:border-primary/50"
              )}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="h-[550px] rounded-xl border border-border bg-card/50 backdrop-blur-md p-4 overflow-hidden shadow-2xl">
              <AgentFeed />
            </div>
          </aside>

          <section className="lg:col-span-9 order-1 lg:order-2">
            <div className="h-[550px] rounded-xl border border-primary/10 bg-card/20 backdrop-blur-sm relative overflow-hidden group shadow-2xl">
              {activeTab === "globe" && (
                <div className="w-full h-full p-2">
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-lg border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-mono text-white/90 tracking-[0.2em] uppercase font-bold">Orbital View</span>
                  </div>
                  <ThreeGlobe />
                </div>
              )}
              {activeTab === "alerts" && <div className="p-6 h-full overflow-auto"><ShortageAlerts /></div>}
              {activeTab === "water" && <div className="p-6 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
              {activeTab === "authorization" && (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-mono">Administrative Console</h3>
                  <p className="text-xs text-muted-foreground mt-2">Manual override requires physical hardware key.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 py-4 px-6 rounded-xl bg-secondary/20 border border-border flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-muted-foreground gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> SYSTEM LIVE
            </span>
            <span className="flex items-center gap-2 uppercase">
              <Activity className="w-3 h-3" /> Data Latency: 44ms
            </span>
          </div>
          <p className="opacity-50 tracking-tighter">PLANETARY RESOURCE ORCHESTRATION ENGINE v1.0.4 - STABLE RELEASE</p>
        </footer>
      </main>
    </div>
  )
}
