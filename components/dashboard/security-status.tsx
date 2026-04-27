"use client"

import { useEffect, useState } from "react"
import { Shield, Lock, Fingerprint, Cpu, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

export function SecurityStatus() {
  const [pulsePhase, setPulsePhase] = useState(0)
  const [isVerified, setIsVerified] = useState(true)

  // Security pulse animation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4">
      {/* Quantum Encryption Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
        <div className="relative">
          <Lock className="w-3.5 h-3.5 text-primary" />
          {/* Encryption active indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-muted-foreground leading-none">
            QUANTUM ENCRYPTED
          </span>
          <span className="text-[10px] font-mono text-primary font-medium leading-tight">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Security Pulse Shield */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* Outer pulse rings */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-primary/30 transition-all duration-1000",
            pulsePhase === 0 && "scale-100 opacity-100",
            pulsePhase === 1 && "scale-150 opacity-50",
            pulsePhase === 2 && "scale-200 opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-1 rounded-full border border-primary/20 transition-all duration-1000 delay-200",
            pulsePhase === 0 && "scale-100 opacity-80",
            pulsePhase === 1 && "scale-125 opacity-40",
            pulsePhase === 2 && "scale-150 opacity-0"
          )}
        />

        {/* Shield icon container */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
          <Shield
            className={cn(
              "w-4 h-4 transition-all duration-500",
              pulsePhase === 0 ? "text-primary scale-100" : "text-primary/70 scale-95"
            )}
          />
        </div>

        {/* Active firewall indicator */}
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span
            className="w-1 h-1 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-card/50 border border-border/50">
          <Cpu className="w-3 h-3 text-accent" />
          <span className="font-mono text-muted-foreground">256-BIT</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-card/50 border border-border/50">
          <Wifi className="w-3 h-3 text-primary" />
          <span className="font-mono text-muted-foreground">SECURE</span>
        </div>
      </div>
    </div>
  )
}

// Biometric verification button to be used alongside authorize buttons
export function BiometricVerification({
  onVerify,
  isVerifying = false,
  isVerified = false,
}: {
  onVerify?: () => void
  isVerifying?: boolean
  isVerified?: boolean
}) {
  return (
    <button
      onClick={onVerify}
      disabled={isVerifying || isVerified}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
        isVerified
          ? "bg-primary/10 border-primary/40 text-primary"
          : "bg-card/50 border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary"
      )}
    >
      {/* Fingerprint icon with scan effect */}
      <div className="relative">
        <Fingerprint
          className={cn(
            "w-5 h-5 transition-all duration-300",
            isVerifying && "animate-pulse",
            isVerified && "text-primary"
          )}
        />
        {isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border border-primary/50 rounded-full animate-ping" />
          </div>
        )}
        {isVerified && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-1.5 h-1.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start">
        <span className="text-[9px] font-mono leading-none opacity-70">BIOMETRIC</span>
        <span className="text-[10px] font-mono font-medium leading-tight">
          {isVerifying ? "SCANNING..." : isVerified ? "VERIFIED" : "VERIFY"}
        </span>
      </div>

      {/* Scan line animation when verifying */}
      {isVerifying && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_1.5s_ease-in-out_infinite]" />
        </div>
      )}
    </button>
  )
}

// Compact security badge for smaller spaces
export function SecurityBadge() {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 1000)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/5 border border-primary/20">
      <div className="relative">
        <Shield
          className={cn(
            "w-3 h-3 text-primary transition-transform duration-500",
            isPulsing && "scale-110"
          )}
        />
        {isPulsing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-primary/50 animate-ping" />
          </div>
        )}
      </div>
      <span className="text-[9px] font-mono text-primary">SECURED</span>
    </div>
  )
}
