"use client"

import { useState, useRef, useEffect } from "react"
import {
  MapPin,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Leaf,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Sparkles,
  Ship,
  Truck,
  Train,
  Plane,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PendingAction {
  id: string
  transactionUuid: string
  sourceProvider: string
  sourceCountry: string
  sourceCoords: { lat: number; lng: number }
  destinationName: string
  destinationCountry: string
  destCoords: { lat: number; lng: number }
  resource: string
  resourceCategory: string
  quantity: number
  unit: string
  negotiatedPrice: number
  shippingCost: number
  totalCost: number
  currency: string
  estimatedDelivery: string
  estimatedDays: number
  carbonOffset: number
  successProbability: number
  livesImpacted: number
  economicValue: number
  aiReasoning: string
  routeData: {
    waypoints: string[]
    transportModes: string[]
  }
  priorityLevel: "critical" | "high" | "medium" | "low"
  createdAt: string
}

const mockPendingActions: PendingAction[] = [
  {
    id: "tx-001",
    transactionUuid: "PRO-2024-DHK-001",
    sourceProvider: "Global Grain Cooperative",
    sourceCountry: "Netherlands",
    sourceCoords: { lat: 51.92, lng: 4.48 },
    destinationName: "Dhaka",
    destinationCountry: "Bangladesh",
    destCoords: { lat: 23.81, lng: 90.41 },
    resource: "Wheat Grain",
    resourceCategory: "food",
    quantity: 12500,
    unit: "metric tons",
    negotiatedPrice: 3500000,
    shippingCost: 562500,
    totalCost: 4062500,
    currency: "USD",
    estimatedDelivery: "2024-11-15",
    estimatedDays: 12,
    carbonOffset: 5250,
    successProbability: 89,
    livesImpacted: 3200000,
    economicValue: 8750000,
    aiReasoning:
      "Analysis indicates a 14-day food security gap in Dhaka region due to delayed monsoon affecting local harvest. Global Grain Cooperative has verified surplus with Grade A+ quality. Shipping via Rotterdam-Singapore-Chittagong route optimized for cost and carbon efficiency. Local distribution network confirmed operational. Risk assessment shows 11% chance of minor delays due to port congestion, mitigated by pre-arranged priority berthing.",
    routeData: {
      waypoints: ["Rotterdam", "Singapore", "Chittagong", "Dhaka"],
      transportModes: ["sea", "sea", "rail"],
    },
    priorityLevel: "critical",
    createdAt: "2024-10-28T09:15:00Z",
  },
  {
    id: "tx-002",
    transactionUuid: "PRO-2024-SAN-002",
    sourceProvider: "Swiss Pharma Alliance",
    sourceCountry: "Switzerland",
    sourceCoords: { lat: 47.38, lng: 8.54 },
    destinationName: "Sanaa",
    destinationCountry: "Yemen",
    destCoords: { lat: 15.37, lng: 44.19 },
    resource: "Vaccines (Standard)",
    resourceCategory: "medicine",
    quantity: 500000,
    unit: "doses",
    negotiatedPrice: 2500000,
    shippingCost: 125000,
    totalCost: 2625000,
    currency: "USD",
    estimatedDelivery: "2024-11-04",
    estimatedDays: 7,
    carbonOffset: 180,
    successProbability: 94,
    livesImpacted: 500000,
    economicValue: 12500000,
    aiReasoning:
      "Critical vaccination campaign required in Sanaa. WHO has certified the batch. Air freight via neutral corridors confirmed. Cold chain integrity guaranteed with redundant monitoring systems. Local health ministry coordination complete. High success probability due to established air corridor and pre-positioned cold storage facilities.",
    routeData: {
      waypoints: ["Geneva", "Amman", "Sanaa"],
      transportModes: ["air", "air"],
    },
    priorityLevel: "critical",
    createdAt: "2024-10-28T11:30:00Z",
  },
  {
    id: "tx-003",
    transactionUuid: "PRO-2024-BEI-003",
    sourceProvider: "Asia Battery Consortium",
    sourceCountry: "South Korea",
    sourceCoords: { lat: 37.57, lng: 126.98 },
    destinationName: "Beirut",
    destinationCountry: "Lebanon",
    destCoords: { lat: 33.89, lng: 35.5 },
    resource: "Battery Storage",
    resourceCategory: "energy",
    quantity: 2500,
    unit: "kWh units",
    negotiatedPrice: 875000,
    shippingCost: 95000,
    totalCost: 970000,
    currency: "USD",
    estimatedDelivery: "2024-11-18",
    estimatedDays: 21,
    carbonOffset: 320,
    successProbability: 86,
    livesImpacted: 1200000,
    economicValue: 4500000,
    aiReasoning:
      "Beirut grid instability creating healthcare and infrastructure risks. Battery storage will provide 72-hour emergency backup for 3 major hospitals and critical infrastructure. Supplier reliability confirmed. Local technical teams trained. Route via Busan-Dubai-Beirut selected for optimal handling of hazmat class 9 materials.",
    routeData: {
      waypoints: ["Busan", "Dubai", "Beirut"],
      transportModes: ["sea", "road"],
    },
    priorityLevel: "high",
    createdAt: "2024-10-28T14:45:00Z",
  },
]

const transportIcons: Record<string, React.ReactNode> = {
  sea: <Ship className="w-4 h-4" />,
  air: <Plane className="w-4 h-4" />,
  rail: <Train className="w-4 h-4" />,
  road: <Truck className="w-4 h-4" />,
}

const priorityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    text: "text-red-400",
    badge: "bg-red-500",
  },
  high: {
    bg: "bg-accent/10",
    border: "border-accent/50",
    text: "text-accent",
    badge: "bg-accent",
  },
  medium: {
    bg: "bg-primary/10",
    border: "border-primary/50",
    text: "text-primary",
    badge: "bg-primary",
  },
  low: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    badge: "bg-muted-foreground",
  },
}

// Slide to Approve component
function SlideToApprove({
  onApprove,
  onReject,
  disabled,
}: {
  onApprove: () => void
  onReject: () => void
  disabled: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [slidePosition, setSlidePosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  const handleDragStart = () => {
    if (disabled || isApproved || isRejected) return
    setIsDragging(true)
  }

  const handleDrag = (clientX: number) => {
    if (!isDragging || !trackRef.current) return

    const track = trackRef.current
    const rect = track.getBoundingClientRect()
    const maxSlide = rect.width - 60 // thumb width

    let newPosition = clientX - rect.left - 30
    newPosition = Math.max(0, Math.min(newPosition, maxSlide))
    setSlidePosition(newPosition)
  }

  const handleDragEnd = () => {
    if (!isDragging || !trackRef.current) return

    const track = trackRef.current
    const rect = track.getBoundingClientRect()
    const maxSlide = rect.width - 60
    const threshold = maxSlide * 0.85

    if (slidePosition >= threshold) {
      setIsApproved(true)
      setSlidePosition(maxSlide)
      setTimeout(() => onApprove(), 300)
    } else {
      setSlidePosition(0)
    }

    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => handleDrag(e.clientX)
  const handleTouchMove = (e: React.TouchEvent) => handleDrag(e.touches[0].clientX)

  const handleReject = () => {
    if (disabled || isApproved || isRejected) return
    setIsRejected(true)
    setTimeout(() => onReject(), 300)
  }

  return (
    <div className="flex items-center gap-4">
      {/* Reject button */}
      <button
        onClick={handleReject}
        disabled={disabled || isApproved || isRejected}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
          isRejected
            ? "bg-red-500 border-red-500 text-white"
            : "border-red-500/50 text-red-400 hover:bg-red-500/20"
        )}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Slide track */}
      <div
        ref={trackRef}
        className={cn(
          "relative flex-1 h-14 rounded-full border-2 overflow-hidden transition-colors",
          isApproved
            ? "bg-green-500/20 border-green-500"
            : "bg-secondary border-primary/30"
        )}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Track background text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-mono text-sm uppercase tracking-wider transition-opacity",
              isApproved
                ? "text-green-400"
                : slidePosition > 50
                ? "opacity-0"
                : "text-muted-foreground"
            )}
          >
            {isApproved ? "AUTHORIZED" : "SLIDE TO AUTHORIZE"}
          </span>
        </div>

        {/* Slide thumb */}
        <div
          className={cn(
            "absolute top-1 left-1 w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all",
            isApproved
              ? "bg-green-500 scale-110"
              : "bg-primary hover:bg-primary/90"
          )}
          style={{
            transform: `translateX(${slidePosition}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {isApproved ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <ChevronRight className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}

// Route visualization
function RouteVisualization({
  waypoints,
  transportModes,
}: {
  waypoints: string[]
  transportModes: string[]
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {waypoints.map((point, idx) => (
        <div key={point} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                idx === 0
                  ? "bg-primary"
                  : idx === waypoints.length - 1
                  ? "bg-accent"
                  : "bg-muted-foreground"
              )}
            />
            <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
              {point}
            </span>
          </div>

          {idx < waypoints.length - 1 && (
            <div className="flex items-center mx-2">
              <div className="w-8 h-0.5 bg-border" />
              <div className="mx-1 text-muted-foreground">
                {transportIcons[transportModes[idx]] || transportIcons.sea}
              </div>
              <div className="w-8 h-0.5 bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Main Authorization Panel
function AuthorizationCard({
  action,
  onApprove,
  onReject,
  onRequestAlternative,
}: {
  action: PendingAction
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRequestAlternative: (id: string) => void
}) {
  const config = priorityConfig[action.priorityLevel]

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", config.border)}>
      {/* Header */}
      <div className={cn("px-6 py-4 border-b", config.bg, "border-border")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn("w-5 h-5", config.text)} />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Action Required
              </div>
              <div className="font-semibold text-foreground">
                Pending Global Allocation
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-mono uppercase font-bold text-white",
                config.badge
              )}
            >
              {action.priorityLevel}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {action.transactionUuid}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Redirecting {action.quantity.toLocaleString()} {action.unit} of{" "}
            {action.resource}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {action.sourceProvider}, {action.sourceCountry}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span>
              {action.destinationName}, {action.destinationCountry}
            </span>
          </div>
        </div>

        {/* Route visualization */}
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Proposed Route
          </div>
          <RouteVisualization
            waypoints={action.routeData.waypoints}
            transportModes={action.routeData.transportModes}
          />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs">Success Probability</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary">
              {action.successProbability}%
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4 text-accent" />
              <span className="text-xs">Estimated Cost</span>
            </div>
            <div className="text-2xl font-bold font-mono text-accent">
              ${(action.totalCost / 1000000).toFixed(2)}M
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs">Lives Impacted</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary">
              {(action.livesImpacted / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs">Est. Delivery</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {action.estimatedDays}d
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary uppercase tracking-wider font-mono">
              AI Reasoning
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {action.aiReasoning}
          </p>
        </div>

        {/* Additional metrics */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">Carbon Offset:</span>
            <span className="font-mono text-green-400">
              {action.carbonOffset.toLocaleString()} kg CO2e
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Economic Value:</span>
            <span className="font-mono text-accent">
              ${(action.economicValue / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <SlideToApprove
            onApprove={() => onApprove(action.id)}
            onReject={() => onReject(action.id)}
            disabled={false}
          />

          <button
            onClick={() => onRequestAlternative(action.id)}
            className="w-full py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm text-foreground font-mono transition-colors"
          >
            REQUEST ALTERNATIVE
          </button>
        </div>
      </div>
    </div>
  )
}

export function DecisionAuthorization() {
  const [pendingActions, setPendingActions] = useState(mockPendingActions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [approvedActions, setApprovedActions] = useState<string[]>([])
  const [rejectedActions, setRejectedActions] = useState<string[]>([])

  const handleApprove = (id: string) => {
    setApprovedActions([...approvedActions, id])
    // In production, this would call the API
    setTimeout(() => {
      if (currentIndex < pendingActions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }, 500)
  }

  const handleReject = (id: string) => {
    setRejectedActions([...rejectedActions, id])
    setTimeout(() => {
      if (currentIndex < pendingActions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }, 500)
  }

  const handleRequestAlternative = (id: string) => {
    // In production, this would trigger a new agent analysis
    console.log("Requesting alternative for:", id)
  }

  const activeActions = pendingActions.filter(
    (a) => !approvedActions.includes(a.id) && !rejectedActions.includes(a.id)
  )

  if (activeActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          All Actions Processed
        </h3>
        <p className="text-muted-foreground">
          {approvedActions.length} authorized, {rejectedActions.length} rejected
        </p>
      </div>
    )
  }

  const currentAction =
    pendingActions[Math.min(currentIndex, pendingActions.length - 1)]

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground font-mono">
            {currentIndex + 1} of {pendingActions.length}
          </span>
          <button
            onClick={() =>
              setCurrentIndex(Math.min(pendingActions.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === pendingActions.length - 1}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400">
            {approvedActions.length} approved
          </span>
          <span className="text-red-400">{rejectedActions.length} rejected</span>
          <span className="text-muted-foreground">
            {activeActions.length} pending
          </span>
        </div>
      </div>

      {/* Current action card */}
      <AuthorizationCard
        action={currentAction}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestAlternative={handleRequestAlternative}
      />
    </div>
  )
}
