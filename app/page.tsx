import { Header } from "@/components/dashboard/header"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { Globe } from "@/components/dashboard/globe"
import { AgentFeed } from "@/components/dashboard/agent-feed"
import { ActionCenter } from "@/components/dashboard/action-center"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6">
        {/* Metrics Row */}
        <section className="mb-6">
          <MetricsCards />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Agent Feed */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="h-[500px] rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
              <AgentFeed />
            </div>
          </aside>

          {/* Center - Globe */}
          <section className="lg:col-span-5 order-1 lg:order-2">
            <div className="h-[500px] rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-4 relative overflow-hidden">
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
                  REAL-TIME VISUALIZATION
                </span>
              </div>

              <Globe />

              {/* Footer stats */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>LATENCY: 12ms</span>
                <span>BANDWIDTH: 847 TB/s</span>
                <span>UPTIME: 99.997%</span>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Action Center */}
          <aside className="lg:col-span-4 order-3">
            <div className="h-[500px] rounded-xl border border-accent/20 bg-card/50 backdrop-blur-sm p-4">
              <ActionCenter />
            </div>
          </aside>
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
          </div>
          <div className="flex items-center gap-4">
            <span>SESSION: 0x7F3A...9B2C</span>
            <span>CLEARANCE: ALPHA-1</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
