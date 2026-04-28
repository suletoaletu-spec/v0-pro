"use client"

import { useState, useRef } from "react"
import { ShieldCheck, AlertTriangle, ChevronRight, Check, Lock } from "lucide-react"

interface PendingAction {
  id: string
  title: string
  description: string
  impact: string
  urgency: "high" | "medium"
  regions: string[]
}

const pendingActions: PendingAction[] = [
  {
    id: "action-1",
    title: "Water Reserve Transfer",
    description: "Authorize 2.4M gallons emergency transfer to drought-affected regions",
    impact: "12 million people",
    urgency: "high",
    regions: ["North Africa", "Middle East"],
  },
  {
    id: "action-2",
    title: "Energy Grid Rebalancing",
    description: "Approve cross-border power redistribution protocol",
    impact: "€240M efficiency gain",
    urgency: "medium",
    regions: ["Central Europe", "Nordic"],
  },
]

function SlideToApprove({
  onApprove,
  disabled,
}: {
  onApprove: () => void
  disabled: boolean
}) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleStart = (clientX: number) => {
    if (disabled || isComplete) return
    isDragging.current = true
  }

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current || disabled) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const maxX = rect.width - 56
    const newProgress = Math.min(Math.max(0, x - 28), maxX) / maxX

    setProgress(newProgress)

    if (newProgress >= 0.95) {
      setIsComplete(true)
      isDragging.current = false
      setTimeout(() => {
        onApprove()
        setProgress(0)
        setIsComplete(false)
      }, 1000)
    }
  }

  const handleEnd = () => {
    if (!isComplete) {
      setProgress(0)
    }
    isDragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-14 rounded-xl overflow-hidden cursor-pointer select-none ${
        disabled
          ? "bg-secondary/50 cursor-not-allowed"
          : isComplete
            ? "bg-primary/20"
            : "bg-secondary"
      }`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-75"
        style={{ width: `${progress * 100}%` }}
      />

      {/* Track text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-sm font-medium tracking-wide transition-opacity ${
            progress > 0.3 ? "opacity-0" : "opacity-100"
          } ${disabled ? "text-muted-foreground" : "text-muted-foreground"}`}
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> SELECT ACTION TO AUTHORIZE
            </span>
          ) : (
            "SLIDE TO AUTHORIZE"
          )}
        </span>
      </div>

      {/* Slider thumb */}
      <div
        className={`absolute top-1 bottom-1 w-12 rounded-lg flex items-center justify-center transition-all ${
          disabled
            ? "bg-muted text-muted-foreground"
            : isComplete
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground"
        }`}
        style={{
          left: `calc(${progress * 100}% * (1 - 56px / 100%) + 4px)`,
          transform: isComplete ? "scale(1.1)" : "scale(1)",
        }}
      >
        {isComplete ? (
          <Check className="w-5 h-5" />
        ) : disabled ? (
          <Lock className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </div>
  )
}

export function ActionCenter() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [approvedActions, setApprovedActions] = useState<string[]>([])

  const handleApprove = () => {
    if (selectedAction) {
      setApprovedActions((prev) => [...prev, selectedAction])
      setSelectedAction(null)
    }
  }

  const availableActions = pendingActions.filter((a) => !approvedActions.includes(a.id))

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <ShieldCheck className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Human-in-the-Loop</h2>
        <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-mono">
          {availableActions.length} PENDING
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {availableActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Check className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">All actions authorized</p>
          </div>
        ) : (
          availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id === selectedAction ? null : action.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedAction === action.id
                  ? "bg-accent/10 border-accent/50"
                  : "bg-secondary/30 border-border/50 hover:border-accent/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-1.5 rounded ${
                    action.urgency === "high"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        action.urgency === "high"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {action.urgency.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{action.description}</p>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-primary font-mono">Impact: {action.impact}</span>
                    <span className="text-muted-foreground">
                      {action.regions.join(" → ")}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedAction === action.id
                      ? "border-accent bg-accent"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedAction === action.id && (
                    <Check className="w-3 h-3 text-accent-foreground" />
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-border">
        <SlideToApprove onApprove={handleApprove} disabled={!selectedAction} />
      </div>
    </div>
  )
}
const handleGlobeAction = async (lat: number, lng: number) => {
  const result = await dispatchGlobalIntelligence(lat, lng);
  
  if (result.success) {
    // UPDATE THE UI TEXT LIVE!
    updateAIReasoning(lat, lng, result.temp, result.humidity);
  }
};

