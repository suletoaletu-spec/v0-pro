"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Shield, Leaf } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  trend: string
  accentColor: "cyan" | "gold"
}

function MetricCard({ title, value, unit, icon, trend, accentColor }: MetricCardProps) {
  const borderColor = accentColor === "cyan" ? "border-primary/30" : "border-accent/30"
  const glowColor = accentColor === "cyan" ? "shadow-primary/20" : "shadow-accent/20"
  const iconBg = accentColor === "cyan" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
  const valueColor = accentColor === "cyan" ? "text-primary" : "text-accent"

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${borderColor} bg-card/50 backdrop-blur-sm p-5 shadow-lg ${glowColor}`}
    >
      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 opacity-5 ${
          accentColor === "cyan"
            ? "bg-gradient-to-br from-primary to-transparent"
            : "bg-gradient-to-br from-accent to-transparent"
        }`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
          <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
            {trend}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${valueColor} tabular-nums`}>{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MetricsCards() {
  const [surplus, setSurplus] = useState(2847)
  const [shortages, setShortages] = useState(156)
  const [carbon, setCarbon] = useState(94.7)

  useEffect(() => {
    const interval = setInterval(() => {
      setSurplus((prev) => prev + Math.floor(Math.random() * 5))
      setShortages((prev) => prev + Math.floor(Math.random() * 2))
      setCarbon((prev) => Math.min(99.9, prev + Math.random() * 0.1))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Global Surplus Detected"
        value={surplus.toLocaleString()}
        unit="units"
        icon={<TrendingUp className="w-5 h-5" />}
        trend="+12.4%"
        accentColor="cyan"
      />
      <MetricCard
        title="Critical Shortages Prevented"
        value={shortages.toLocaleString()}
        unit="incidents"
        icon={<Shield className="w-5 h-5" />}
        trend="+8.2%"
        accentColor="gold"
      />
      <MetricCard
        title="Live Carbon Savings"
        value={carbon.toFixed(1)}
        unit="MT/hr"
        icon={<Leaf className="w-5 h-5" />}
        trend="+5.7%"
        accentColor="cyan"
      />
    </div>
  )
}<div className="text-3xl font-bold text-cyan-400">
  <AnimatedNumber value={12.4} suffix="M" /> <span className="text-sm font-normal text-white/50">people</span>
</div>


