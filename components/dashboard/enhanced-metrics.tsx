"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, Scale, Leaf, DollarSign, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface Metric {
  id: string
  label: string
  value: number
  unit: string
  prefix?: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: "cyan" | "gold" | "green"
}

const formatValue = (value: number, compact: boolean = true): string => {
  if (compact) {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + "B"
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K"
    }
  }
  return value.toLocaleString()
}

const colorConfig = {
  cyan: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    glow: "shadow-primary/20",
    icon: "text-primary",
  },
  gold: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    text: "text-accent",
    glow: "shadow-accent/20",
    icon: "text-accent",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    glow: "shadow-green-500/20",
    icon: "text-green-400",
  },
}

function MetricCard({ metric }: { metric: Metric }) {
  const [displayValue, setDisplayValue] = useState(0)
  const config = colorConfig[metric.color]

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = metric.value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, metric.value)
      setDisplayValue(Math.floor(current))

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(metric.value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [metric.value])

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]",
        config.bg,
        config.border,
        "shadow-lg",
        config.glow
      )}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />

      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", config.bg, config.icon)}>
          {metric.icon}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-mono",
            metric.change >= 0 ? "text-green-400" : "text-red-400"
          )}
        >
          <TrendingUp
            className={cn("w-3 h-3", metric.change < 0 && "rotate-180")}
          />
          {metric.change >= 0 ? "+" : ""}
          {metric.change}%
        </div>
      </div>

      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-mono">
        {metric.label}
      </div>

      <div className="flex items-baseline gap-1.5">
        {metric.prefix && (
          <span className={cn("text-lg font-bold", config.text)}>
            {metric.prefix}
          </span>
        )}
        <span className={cn("text-3xl font-bold font-mono", config.text)}>
          {formatValue(displayValue)}
        </span>
        <span className="text-sm text-muted-foreground">{metric.unit}</span>
      </div>

      <div className="text-xs text-muted-foreground mt-2">{metric.changeLabel}</div>
    </div>
  )
}

export function EnhancedMetrics() {
  const metrics: Metric[] = [
    {
      id: "lives",
      label: "Lives Impacted",
      value: 12400000,
      unit: "people",
      change: 18.5,
      changeLabel: "vs. last month",
      icon: <Users className="w-5 h-5" />,
      color: "cyan",
    },
    {
      id: "waste",
      label: "Tons of Waste Saved",
      value: 45200,
      unit: "metric tons",
      change: 12.3,
      changeLabel: "prevented from landfills",
      icon: <Scale className="w-5 h-5" />,
      color: "gold",
    },
    {
      id: "carbon",
      label: "Carbon Savings",
      value: 8543,
      unit: "tons CO2e",
      change: 24.7,
      changeLabel: "offset this quarter",
      icon: <Leaf className="w-5 h-5" />,
      color: "green",
    },
    {
      id: "economic",
      label: "Economic Value Generated",
      value: 2450000000,
      unit: "USD",
      prefix: "$",
      change: 31.2,
      changeLabel: "total value created",
      icon: <DollarSign className="w-5 h-5" />,
      color: "gold",
    },
    {
      id: "shortages",
      label: "Shortages Prevented",
      value: 127,
      unit: "events",
      change: 8.4,
      changeLabel: "crises averted",
      icon: <Activity className="w-5 h-5" />,
      color: "cyan",
    },
    {
      id: "surplus",
      label: "Global Surplus Detected",
      value: 89500,
      unit: "metric tons",
      change: 15.8,
      changeLabel: "available for redistribution",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "green",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
