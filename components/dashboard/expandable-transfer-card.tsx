"use client"

import { useState, useRef, useEffect } from "react"
import {
  Droplets,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Ship,
  Anchor,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Satellite,
  ThermometerSun,
  BarChart3,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TransferCardProps {
  id: string
  title: string
  quantity: number
  unit: string
  sourceLocation: string
  destinationLocation: string
  priorityLevel: "critical" | "high" | "medium" | "low"
  aiReasoning: string
  logisticsDetails: string[]
  confidenceScore: number
  dataSource: string
  onAuthorize: (id: string) => void
  isAuthorized?: boolean
}

const priorityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    text: "text-red-400",
    glow: "shadow-red-500/20",
  },
  high: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  medium: {
    bg: "bg-primary/10",
    border: "border-primary/50",
    text: "text-primary",
    glow: "shadow-primary/20",
  },
  low: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    glow: "shadow-muted/20",
  },
}

function AnimatedConfidenceRing({
  percentage,
  size = 120,
}: {
  percentage: number
  size?: number
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedPercentage / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const getColor = () => {
    if (percentage >= 95) return "stroke-green-400"
    if (percentage >= 85) return "stroke-primary"
    if (percentage >= 70) return "stroke-amber-400"
    return "stroke-red-400"
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(getColor(), "transition-all duration-1000 ease-out")}
          style={{
            filter: "drop-shadow(0 0 8px currentColor)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold font-mono", getColor().replace("stroke-", "text-"))}>
          {animatedPercentage}%
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Confidence
        </span>
      </div>
    </div>
  )
}

function GlowingAuthorizeButton({
  onAuthorize,
  isAuthorized,
  isLoading,
}: {
  onAuthorize: () => void
  isAuthorized: boolean
  isLoading: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (isAuthorized) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-green-500/20 border border-green-500/50 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-green-400" />
        <span className="font-mono text-green-400 uppercase tracking-wider">
          Authorized
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={onAuthorize}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative px-8 py-4 rounded-xl font-mono uppercase tracking-wider font-bold",
        "bg-primary text-primary-foreground",
        "transition-all duration-300 ease-out",
        "border-2 border-primary",
        isHovered && "scale-105",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      style={{
        boxShadow: isHovered
          ? "0 0 30px rgba(0, 220, 220, 0.5), 0 0 60px rgba(0, 220, 220, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)"
          : "0 0 15px rgba(0, 220, 220, 0.2)",
      }}
    >
      {/* Animated border glow */}
      <span
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0, 220, 220, 0.4), transparent)",
          animation: isHovered ? "shimmer 2s linear infinite" : "none",
        }}
      />
      
      {/* Button text */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Authorize Transfer
          </>
        )}
      </span>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  )
}

export function ExpandableTransferCard({
  id,
  title,
  quantity,
  unit,
  sourceLocation,
  destinationLocation,
  priorityLevel,
  aiReasoning,
  logisticsDetails,
  confidenceScore,
  dataSource,
  onAuthorize,
  isAuthorized = false,
}: TransferCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const config = priorityConfig[priorityLevel]

  const handleAuthorize = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onAuthorize(id)
    setIsLoading(false)
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-300",
        "bg-card hover:bg-card/80",
        config.border,
        isExpanded && "shadow-lg",
        isExpanded && config.glow
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-6 py-5 flex items-center justify-between",
          "hover:bg-secondary/30 transition-colors",
          "text-left"
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              config.bg,
              "border",
              config.border
            )}
          >
            <Droplets className={cn("w-6 h-6", config.text)} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase",
                  "bg-primary/20 text-primary border border-primary/30"
                )}
              >
                {priorityLevel}
              </span>
              {isAuthorized && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                  Authorized
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {sourceLocation} → {destinationLocation}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="font-mono text-primary">
                {quantity.toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-muted-foreground">Confidence</div>
            <div className={cn("font-mono font-bold", confidenceScore >= 90 ? "text-green-400" : "text-primary")}>
              {confidenceScore}%
            </div>
          </div>
          
          <div
            className={cn(
              "p-2 rounded-lg bg-secondary transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
          {/* AI Reasoning Section */}
          <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-mono uppercase tracking-wider text-primary font-semibold">
                AI Reasoning
              </span>
            </div>
            <p className="text-foreground leading-relaxed">{aiReasoning}</p>
            
            {/* Data source badge */}
            <div className="mt-4 flex items-center gap-2">
              <Satellite className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Data Source: <span className="text-primary font-mono">{dataSource}</span>
              </span>
            </div>
          </div>

          {/* Two column layout for details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logistics Details */}
            <div className="p-5 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Ship className="w-5 h-5 text-accent" />
                <span className="text-sm font-mono uppercase tracking-wider text-accent font-semibold">
                  Logistics
                </span>
              </div>
              
              <ul className="space-y-3">
                {logisticsDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-sm text-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confidence Score */}
            <div className="p-5 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-mono uppercase tracking-wider text-primary font-semibold">
                  Success Analysis
                </span>
              </div>
              
              <AnimatedConfidenceRing percentage={confidenceScore} />
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Based on historical data, weather patterns, and route analysis
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-2">
            <GlowingAuthorizeButton
              onAuthorize={handleAuthorize}
              isAuthorized={isAuthorized}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo component with mock data
export function WaterReserveTransferDemo() {
  const [authorizedCards, setAuthorizedCards] = useState<string[]>([])

  const handleAuthorize = (id: string) => {
    setAuthorizedCards((prev) => [...prev, id])
  }

  const mockTransfers = [
    {
      id: "wrt-001",
      title: "Water Reserve Transfer",
      quantity: 2500000,
      unit: "liters",
      sourceLocation: "Rotterdam Reservoir",
      destinationLocation: "Region X (Sahel)",
      priorityLevel: "critical" as const,
      aiReasoning:
        "Drought predicted in Region X based on NASA soil moisture data (SMAP satellite). Current moisture levels at 12% — critically below the 25% threshold. Combined analysis with NOAA seasonal forecasts indicates 87% probability of extended dry period lasting 6-8 weeks. Local groundwater reserves depleted to 15% capacity. Immediate intervention required to prevent humanitarian crisis affecting 340,000 residents.",
      logisticsDetails: [
        "3 cargo ships diverted from Port A to Port B",
        "Estimated transit time: 4 days via Mediterranean route",
        "Cold storage containers not required — ambient transport approved",
        "Local distribution network activated with 12 tanker trucks",
        "WHO water quality certification obtained",
      ],
      confidenceScore: 98,
      dataSource: "NASA SMAP Satellite + NOAA Climate Data",
    },
    {
      id: "wrt-002",
      title: "Emergency Water Supply",
      quantity: 850000,
      unit: "liters",
      sourceLocation: "Alpine Reserve Station",
      destinationLocation: "Chennai Metro Area",
      priorityLevel: "high" as const,
      aiReasoning:
        "Monsoon delay detected — 23 days behind historical average. Chennai reservoirs at 18% capacity with consumption rate exceeding replenishment by 2.3x. Population density analysis indicates 2.1M residents in affected zone. Cross-referencing with economic indices shows potential $45M agricultural impact if not addressed within 10 days.",
      logisticsDetails: [
        "Air freight allocation confirmed — 2 C-17 transports",
        "Ground distribution partnership with local NGOs established",
        "Water purification units deployed to 8 distribution points",
        "Real-time GPS tracking enabled for all shipments",
      ],
      confidenceScore: 91,
      dataSource: "IMD Weather Data + Sentinel-2 Imagery",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Water Resource Transfers
        </h2>
        <span className="ml-auto text-sm text-muted-foreground font-mono">
          {mockTransfers.length} pending
        </span>
      </div>

      {mockTransfers.map((transfer) => (
        <ExpandableTransferCard
          key={transfer.id}
          {...transfer}
          onAuthorize={handleAuthorize}
          isAuthorized={authorizedCards.includes(transfer.id)}
        />
      ))}
    </div>
  )
}
