'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressTimerProps {
  timeRemaining: number
  totalTime: number
  className?: string
}

export function ProgressTimer({
  timeRemaining,
  totalTime,
  className,
}: ProgressTimerProps) {
  const validTime = timeRemaining || 0
  const validTotal = totalTime || 1
  const progress = Math.max(0, Math.min(100, (validTime / validTotal) * 100)) || 0
  
  const isCritical = validTime <= 3

  return (
    <div className={cn("relative w-full flex flex-col gap-2", className)}>
      <div className="flex justify-between items-baseline px-1">
        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] font-sans">
          Time Remaining
        </span>
        <span className={cn(
          "text-sm font-black font-sans leading-none",
          isCritical ? "text-red-500 animate-pulse" : "text-white"
        )}>
          {validTime}s
        </span>
      </div>
      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            isCritical ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
      </div>
    </div>
  )
}
