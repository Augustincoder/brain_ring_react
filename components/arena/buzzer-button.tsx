'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuzzer } from '@/hooks/use-buzzer'

interface BuzzerButtonProps {
  className?: string
  disabled?: boolean
}

export function BuzzerButton({ className, disabled }: BuzzerButtonProps) {
  const { canPress, pressBuzzer } = useBuzzer()
  
  const isDisabled = disabled || !canPress

  const handleBuzz = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDisabled) return
    e.preventDefault()
    e.stopPropagation()
    pressBuzzer()
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <motion.button
        whileHover={!isDisabled ? { scale: 1.03 } : {}}
        whileTap={!isDisabled ? { scale: 0.92 } : {}}
        disabled={isDisabled}
        onClick={handleBuzz}
        className={cn(
          "relative h-40 w-40 rounded-full transition-all duration-300 select-none outline-none",
          "flex items-center justify-center overflow-hidden",
          "border-4",
          isDisabled 
            ? "bg-white/[0.02] border-white/[0.03] cursor-not-allowed opacity-40" 
            : "bg-gradient-to-b from-primary to-primary/90 border-primary/30 cursor-pointer shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.4)]"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <motion.div
            animate={!isDisabled ? { 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1] 
            } : {}}
            transition={{ 
              duration: 0.5,
              repeat: !isDisabled ? Infinity : 0,
              repeatDelay: 2 
            }}
          >
            <Zap className={cn(
              "h-12 w-12",
              isDisabled ? "text-white/10" : "text-neutral-950"
            )} fill={isDisabled ? "none" : "currentColor"} />
          </motion.div>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-[0.25em]",
            isDisabled ? "text-white/10" : "text-neutral-950/70"
          )}>
            BUZZ
          </span>
        </div>
      </motion.button>
    </div>
  )
}