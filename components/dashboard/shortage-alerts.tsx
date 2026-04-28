"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, Clock, MapPin, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  location: string
  country: string
  resource: string
  severity: "critical" | "high" | "medium" | "low"
  predictedShortage: number
  daysUntil: number
  population: number
  confidence: number
  trend: "increasing" | "stable" | "decreasing"
}

const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    location: "Dhaka",
    country: "Bangladesh",
    resource: "Wheat Grain",
    severity: "critical",
    predictedShortage: 12500,
    daysUntil: 14,
    population: 3200000,
    confidence: 89,
    trend: "increasing",
  },
  {
    id: "alert-2",
    location: "Sanaa",
    country: "Yemen",
    resource: "Vaccines",
    severity: "critical",
    predictedShortage: 500000,
    daysUntil: 7,
    population: 500000,
    confidence: 94,
    trend: "stable",
  },
  {
    id: "alert-3",
    location: "Beirut",
    country: "Lebanon",
    resource: "Battery Storage",
    severity: "high",
    predictedShortage: 2500,
    daysUntil: 21,
    population: 1200000,
    confidence: 86,
    trend: "increasing",
  },
  {
    id: "alert-4",
    location: "Lagos",
    country: "Nigeria",
    resource: "Rice",
    severity: "high",
    predictedShortage: 8000,
    daysUntil: 18,
    population: 2100000,
    confidence: 82,
    trend: "stable",
  },
  {
    id: "alert-5",
    location: "Caracas",
    country: "Venezuela",
    resource: "Medicine",
    severity: "medium",
    predictedShortage: 250000,
    daysUntil: 30,
    population: 850000,
    confidence: 78,
    trend: "decreasing",
  },
]

const severityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    text: "text-red-400",
    badge: "bg-red-500",
    glow: "shadow-red-500/20",
  },
  high: {
    bg: "bg-accent/10",
    border: "border-accent/50",
    text: "text-accent",
    badge: "bg-accent",
    glow: "shadow-accent/20",
  },
  medium: {
    bg: "bg-primary/10",
    border: "border-primary/50",
    text: "text-primary",
    badge: "bg-primary",
    glow: "shadow-primary/20",
  },
  low: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    badge: "bg-muted-foreground",
    glow: "",
  },
}

function AlertCard({ alert, isNew }: { alert: Alert; isNew?: boolean }) {
  const config = severityConfig[alert.severity]
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-300 cursor-pointer",
        config.bg,
        config.border,
        isNew && "animate-pulse",
        isExpanded && "ring-1 ring-primary/50"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Severity indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          config.badge
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 ml-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold text-primary-foreground",
                config.badge
              )}
            >
              {alert.severity}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {alert.daysUntil}d
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="font-semibold text-foreground text-sm">
              {alert.location}
            </span>
            <span className="text-muted-foreground text-xs">
              {alert.country}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            {alert.resource} shortage predicted
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              alert.trend === "increasing"
                ? "text-red-400"
                : alert.trend === "decreasing"
                ? "text-green-400"
                : "text-muted-foreground"
            )}
          >
            <TrendingUp
              className={cn(
                "w-3 h-3",
                alert.trend === "decreasing" && "rotate-180"
              )}
            />
            {alert.trend}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {alert.confidence}% conf
          </div>
        </div>

        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-90"
          )}
        />
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border ml-2 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Shortage Amount</div>
            <div className="font-mono text-foreground font-semibold">
              {alert.predictedShortage.toLocaleString()}{" "}
              {alert.resource.includes("Vaccine") ? "doses" : "tons"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">People Affected</div>
            <div className="font-mono text-foreground font-semibold">
              {(alert.population / 1000000).toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Time to Shortage</div>
            <div className="font-mono text-foreground font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {alert.daysUntil} days
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">AI Confidence</div>
            <div className="font-mono text-foreground font-semibold">
              {alert.confidence}%
            </div>
          </div>
          <div className="col-span-2">
            <button className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-md text-primary text-xs font-mono transition-colors">
              VIEW ACTION PLAN
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ShortageAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all")

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === filter)

  const criticalCount = alerts.filter((a) => a.severity === "critical").length
  const highCount = alerts.filter((a) => a.severity === "high").length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-foreground">Shortage Alerts</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-mono rounded">
            {criticalCount} CRITICAL
          </span>
          <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-mono rounded">
            {highCount} HIGH
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["all", "critical", "high", "medium"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-mono rounded-md transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} isNew={index === 0} />
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {filteredAlerts.length} active alerts
          </span>
          <span className="text-muted-foreground font-mono">
            Updated 30s ago
          </span>
        </div>
      </div>
    </div>
  )
}
// Inside your Alerts Component
const handleAlertResponse = async (city: string, lat: number, lng: number, resource: string) => {
  // 1. Visual feedback in the console/logs
  setLogs(prev => [`EMERGENCY PROTOCOL: ${city.toUpperCase()}`, `RESOURCE: ${resource.toUpperCase()}`, ...prev]);

  // 2. Trigger the Real-World Satellite Intelligence (from our previous step)
  const result = await dispatchGlobalIntelligence(lat, lng);

  if (result.success) {
    toast.success(`RESPONSE INITIALIZED: ${city}`, {
      description: `Intel report for ${resource} sent to command center.`,
      style: { background: '#000', border: '1px solid #00ff41', color: '#00ff41' }
    });
  }
};

// ... inside your JSX where the cards are rendered:
{alerts.map((alert) => (
  <div 
    key={alert.id}
    onClick={() => handleAlertResponse(alert.location, alert.lat, alert.lng, alert.type)}
    className="cursor-pointer group hover:bg-white/5 transition-all duration-300 active:scale-95"
  >
    {/* Keep your current alert card design here */}
    <div className="flex justify-between items-start">
       {/* Dhaka, Sanaa, etc. */}
    </div>
  </div>
))}
