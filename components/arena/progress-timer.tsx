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
    <div className={cn("relative w-full flex flex-col gap-3", className)}>
      <div className="flex justify-between items-baseline px-1">
        <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
          Time
        </span>
        <motion.span 
          animate={{ 
            scale: isCritical ? [1, 1.08, 1] : 1,
          }}
          transition={{ 
            duration: 0.4,
            repeat: isCritical ? Infinity : 0,
          }}
          className={cn(
            "text-sm font-bold tabular-nums transition-colors duration-300",
            isCritical ? "text-red-400" : "text-white/90"
          )}
        >
          {validTime}s
        </motion.span>
      </div>
      <div className="relative h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCritical 
              ? "bg-gradient-to-r from-red-500 to-red-400" 
              : "bg-gradient-to-r from-primary to-primary/80"
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
        {isCritical && (
          <motion.div 
            className="absolute inset-0 bg-red-500/20"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  )
}