'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    pressBuzzer()
  }

  return (
    <div className={cn("relative group/buzzer pointer-events-auto h-52 w-52 flex items-center justify-center", className)}>
      {/* Dynamic Glow Aura */}
      <AnimatePresence>
        {!isDisabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse"
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.9, y: 10 } : {}}
        disabled={isDisabled}
        onClick={handleBuzz}
        className={cn(
          "relative h-44 w-44 rounded-full transition-all duration-300 select-none outline-none",
          "border-[8px] flex items-center justify-center overflow-hidden",
          isDisabled 
            ? "bg-neutral-900 border-neutral-800 cursor-not-allowed opacity-50 grayscale" 
            : "bg-primary border-primary/40 shadow-[0_25px_50px_-12px_rgba(var(--primary),0.5)] cursor-pointer"
        )}
      >
        {/* Inner shadow/depth effect */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="flex flex-col items-center justify-center gap-1">
          <Zap className={cn(
            "h-14 w-14 transition-transform duration-300",
            !isDisabled && "group-hover/buzzer:scale-110 group-hover/buzzer:rotate-12",
            isDisabled ? "text-neutral-700" : "text-neutral-950"
          )} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.3em] font-sans",
            isDisabled ? "text-neutral-800" : "text-neutral-950/70"
          )}>
            BUZZ
          </span>
        </div>

        {/* Glossy overlay */}
        <div className="absolute inset-0 ring-inset ring-1 ring-white/10 rounded-full" />
      </motion.button>
      
      {/* Bottom shadow for floating effect */}
      {!isDisabled && (
        <div className="absolute -bottom-8 w-32 h-4 bg-primary/20 blur-xl rounded-full" />
      )}
    </div>
  )
}
