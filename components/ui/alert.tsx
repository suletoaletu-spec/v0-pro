"use client"

import { useState } from "react"
import { AlertTriangle, TrendingUp, Clock, MapPin, ChevronRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { dispatchGlobalIntelligence } from "@/lib/SupportLogic" // Make sure this path is correct!
import { toast } from "sonner" 

// ... Keep your Alert Interface and mockAlerts from before ...

export function AlertCard({ alert, isNew }: { alert: any; isNew?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)

  // THE FIX: This function now handles the click correctly
  const handleActionPlan = async (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: This stops the card from toggling open/close
    setIsDispatching(true);
    
    console.log("Response Initiated for:", alert.location);

    const result = await dispatchGlobalIntelligence(alert.lat, alert.lng);
    
    if (result.success) {
      toast.success(`INTEL DISPATCHED`, {
        description: `Satellite data for ${alert.location} sent to Command Center.`,
      });
    } else {
      toast.error("Dispatch Failed. Check satellite link.");
    }
    
    setIsDispatching(false);
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border border-red-500/30 bg-red-500/5 transition-all cursor-pointer",
        isExpanded && "ring-1 ring-cyan-500/50"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-mono text-red-400 mb-1">CRITICAL ALERT</div>
          <div className="font-bold text-white flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {alert.location}
          </div>
          <div className="text-xs text-white/60">{alert.resource} Shortage</div>
        </div>
        <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
      </div>

      {/* Expanded section with the working button */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
          <button 
            type="button"
            disabled={isDispatching}
            onClick={handleActionPlan}
            className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs font-mono flex items-center justify-center gap-2"
          >
            {isDispatching ? (
              <>
                <Zap className="w-3 h-3 animate-spin" />
                <span>TRANSMITTING...</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                <span>INITIALIZE RESPONSE PLAN</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
