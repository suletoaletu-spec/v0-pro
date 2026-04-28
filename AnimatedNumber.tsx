"use client"
import { useEffect, useState } from "react"

export function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 2000 // 2 seconds animation
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}
    </span>
  )
}
