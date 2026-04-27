"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { WaterReserveTransferDemo } from "@/components/dashboard/expandable-transfer-card"
import { Globe2, AlertTriangle, Shield, Activity, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-mono text-primary/60 animate-pulse">
            CONNECTING TO GLOBAL NODES...
          </span>
        </div>
      </div>
    ),
  }
)

type TabType = "globe" | "alerts" | "authorization" | "water"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("globe")

  const tabs = [
    { id: "globe" as const, label: "Global View", icon: Globe2 },
    { id: "alerts" as const, label: "Shortage Alerts", icon: AlertTriangle },
    { id: "water" as const, label: "Water Transfers", icon: Droplets },
    { id: "authorization" as const, label: "Authorization", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        <section className="mb-6">
          <EnhancedMetrics />
        </section>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all whitespace-nowrap border",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-primary/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="h-[600px] rounded-xl border border-border bg-card/50 backdrop-blur-md p-4 overflow-hidden shadow-inner">
              <AgentFeed />
            </div>
          </aside>

          <section className="lg:col-span-9 order-1 lg:order-2">
            <div className="h-[600px] rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm relative overflow-hidden group">
              {activeTab === "globe" && (
                <div className="w-full h-full p-4">
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-mono text-primary tracking-widest uppercase">
                      Live Resource Stream
                    </span>
                  </div>
                  <ThreeGlobe />
                </div>
              )}
              {activeTab === "alerts" && <div className="p-6 h-full overflow-auto"><ShortageAlerts /></div>}
              {activeTab === "water" && <div className="p-6 h-full overflow-auto"><WaterReserveTransferDemo /></div>}
              {activeTab === "authorization" && <div className="p-6 h-full overflow-auto"><DecisionAuthorization /></div>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
