"use client"

import { useState } from "react"
import { AlertTriangle, TrendingUp, Clock, MapPin, ChevronRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { dispatchGlobalIntelligence } from "@/lib/SupportLogic" // Import our intelligence function
import { toast } from "sonner" // For the professional alert feedback

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
  lat: number // Added for Intelligence Dispatch
  lng: number // Added for Intelligence Dispatch
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
    lat: 23.81, lng: 90.41
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
    lat: 15.35, lng: 44.20
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
    lat: 33.89, lng: 35.50
  }
]

// ... (Keep severityConfig and AlertCard styles as they are)

function AlertCard({ alert, isNew }: { alert: Alert; isNew?: boolean }) {
  const config = severityConfig[alert.severity]
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)

  // THE KEY ACTION: Triggers Satellite Intel + Email
  const handleActionPlan = async (e: React.MouseEvent) => {
    e.stopPropagation() // Don't close the card when clicking button
    setIsDispatching(true)
    
    const result = await dispatchGlobalIntelligence(alert.lat, alert.lng)
    
    if (result.success) {
      toast.success(`RESPONSE ACTIVE: ${alert.location}`, {
        description: `Satellite report for ${alert.resource} sent. Local Temp: ${result.temp}°C`,
        style: { background: '#080a12', border: '1px solid #00f0ff', color: '#00f0ff' }
      })
    }
    setIsDispatching(false)
  }

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-300 cursor-pointer",
        config.bg, config.border,
        isNew && "animate-pulse",
        isExpanded && "ring-1 ring-primary/50"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", config.badge)} />

      {/* Header Info (Keep your current UI) */}
      <div className="flex items-start justify-between gap-3 ml-2">
         {/* ... (Your header code) ... */}
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold text-primary-foreground", config.badge)}>
                  {alert.severity}
               </span>
               <span className="text-xs text-muted-foreground font-mono">{alert.daysUntil}d</span>
            </div>
            <div className="font-semibold text-foreground text-sm">{alert.location}</div>
            <div className="text-xs text-muted-foreground">{alert.resource} shortage</div>
         </div>
         <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border ml-2 grid grid-cols-2 gap-4 text-xs animate-in fade-in slide-in-from-top-2">
          {/* ... (Your stats code) ... */}
          <div className="col-span-2">
            <button 
              disabled={isDispatching}
              onClick={handleActionPlan}
              className={cn(
                "w-full py-2 flex items-center justify-center gap-2 border rounded-md text-xs font-mono transition-all",
                isDispatching ? "bg-white/10 text-white/40 border-white/10" : "bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary"
              )}
            >
              <Zap className={cn("w-3 h-3", isDispatching && "animate-spin")} />
              {isDispatching ? "TRANSMITTING INTEL..." : "INITIALIZE RESPONSE PLAN"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ... (Keep the main ShortageAlerts wrapper code)
