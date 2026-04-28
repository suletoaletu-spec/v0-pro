"use client"

import { useEffect, useState } from "react"
import { Bot, ArrowRight, Clock } from "lucide-react"

interface AgentActivity {
  id: string
  agent: string
  action: string
  target: string
  status: "negotiating" | "pending" | "complete"
  timestamp: string
}

const agentActions = [
  { agent: "ALPHA-7", action: "Negotiating water rights", target: "EU → MENA Region" },
  { agent: "BETA-12", action: "Balancing grain surplus", target: "NA → South Asia" },
  { agent: "GAMMA-3", action: "Rerouting energy grid", target: "Nordic → Central EU" },
  { agent: "DELTA-9", action: "Medical supply allocation", target: "Asia Pacific → Africa" },
  { agent: "EPSILON-1", action: "Rare earth redistribution", target: "LATAM → East Asia" },
  { agent: "ZETA-5", action: "Fuel reserve optimization", target: "Middle East → Oceania" },
  { agent: "THETA-8", action: "Agricultural yield sharing", target: "South America → Caribbean" },
  { agent: "IOTA-2", action: "Semiconductor logistics", target: "Taiwan → Global" },
]

export function AgentFeed() {
  const [activities, setActivities] = useState<AgentActivity[]>([])

  useEffect(() => {
    // Initialize with some activities
    const initial = agentActions.slice(0, 4).map((action, i) => ({
      id: `init-${i}`,
      ...action,
      status: i === 0 ? "negotiating" : i === 1 ? "pending" : "complete",
      timestamp: `${i + 1}m ago`,
    })) as AgentActivity[]
    setActivities(initial)

    // Add new activities periodically
    const interval = setInterval(() => {
      const randomAction = agentActions[Math.floor(Math.random() * agentActions.length)]
      const newActivity: AgentActivity = {
        id: Date.now().toString(),
        ...randomAction,
        status: "negotiating",
        timestamp: "now",
      }

      setActivities((prev) => {
        const updated = prev.map((a) => ({
          ...a,
          status:
            a.status === "negotiating"
              ? "pending"
              : a.status === "pending"
                ? "complete"
                : a.status,
          timestamp:
            a.timestamp === "now"
              ? "1m ago"
              : a.timestamp === "1m ago"
                ? "2m ago"
                : a.timestamp,
        })) as AgentActivity[]
        return [newActivity, ...updated].slice(0, 5)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: AgentActivity["status"]) => {
    switch (status) {
      case "negotiating":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-accent text-accent-foreground"
      case "complete":
        return "bg-secondary text-muted-foreground"
    }
  }

  const getStatusDot = (status: AgentActivity["status"]) => {
    switch (status) {
      case "negotiating":
        return "bg-primary animate-pulse"
      case "pending":
        return "bg-accent"
      case "complete":
        return "bg-muted-foreground"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Bot className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Agent Intelligence</h2>
        <span className="ml-auto text-xs text-muted-foreground font-mono">LIVE</span>
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-primary">{activity.agent}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(activity.status)}`} />
              <span
                className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}
              >
                {activity.status.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-foreground mb-2">{activity.action}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                <span className="font-mono">{activity.target}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
const processProtocol = (report: any) => {
  if (report.title.includes("Urgent") || report.title.includes("Emergency")) {
    return { status: "CRITICAL", action: "DEPLOYING AGENT DELTA-9" };
  }
  return { status: "MONITORING", action: "BALANCING SURPLUS" };
};

