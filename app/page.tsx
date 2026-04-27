"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EnhancedMetrics } from "@/components/dashboard/enhanced-metrics"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ShortageAlerts } from "@/components/dashboard/shortage-alerts"
import { DecisionAuthorization } from "@/components/dashboard/decision-authorization"
import { Globe2, AlertTriangle, Shield, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

// Dynamic import for Three.js globe (client-side only)
const ThreeGlobe = dynamic(
  () => import("@/components/dashboard/three-globe").then((mod) => mod.ThreeGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted-foreground">
            INITIALIZING GLOBE...
          </span>
        </div>
      </div>
    ),
  }
)

type TabType = "globe" | "alerts" | "authorization"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("globe")

  const tabs = [
    { id: "globe" as const, label: "Global View", icon: Globe2 },
    { id: "alerts" as const, label: "Shortage Alerts", icon: AlertTriangle },
    { id: "authorization" as const, label: "Authorization", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6">
        {/* Metrics Row */}
        <section className="mb-6">
          <EnhancedMetrics />
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Agent Feed */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="h-[600px] rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 overflow-hidden">
              <AgentFeed />
            </div>
          </aside>

          {/* Center - Dynamic Content based on tab */}
          <section className="lg:col-span-9 order-1 lg:order-2">
            {activeTab === "globe" && (
              <div className="h-[600px] rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-4 relative overflow-hidden">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/40" />

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono text-primary/80 tracking-wider">
                      GLOBAL RESOURCE FLOW
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    3D REAL-TIME VISUALIZATION
                  </span>
                </div>

                <div className="h-[calc(100%-60px)]">
                  <ThreeGlobe />
                </div>

                {/* Footer stats */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>LATENCY: 12ms</span>
                  <span>ACTIVE FLOWS: 5</span>
                  <span>UPTIME: 99.997%</span>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="h-[600px] rounded-xl border border-accent/20 bg-card/50 backdrop-blur-sm p-6 overflow-hidden">
                <ShortageAlerts />
              </div>
            )}

            {activeTab === "authorization" && (
              <div className="h-[600px] rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6 overflow-y-auto">
                <DecisionAuthorization />
              </div>
            )}
          </section>
        </div>

        {/* Footer Status Bar */}
        <footer className="mt-6 py-3 px-4 rounded-lg bg-card/30 border border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              QUANTUM ENCRYPTION: ACTIVE
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              AI GOVERNANCE: SUPERVISED
            </span>
            <span className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              AGENTS: 3 ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>SESSION: 0x7F3A...9B2C</span>
            <span>CLEARANCE: COMMANDER</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
