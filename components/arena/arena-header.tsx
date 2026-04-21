'use client'

import React from 'react'
import { X, Trophy, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ArenaHeaderProps {
  onBack: () => void
  currentQuestion: number
  totalQuestions: number
  modeName?: string
  className?: string
}

export function ArenaHeader({ 
  onBack, 
  currentQuestion, 
  totalQuestions, 
  modeName = 'Brain Ring',
  className 
}: ArenaHeaderProps) {
  return (
    <header className={cn("w-full fixed top-0 left-0 z-50", className)}>
      <div className="z-20 flex items-center justify-between px-6 py-4 bg-neutral-950/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5" 
            onClick={onBack}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] font-sans">
              Arena
            </span>
            <h1 className="text-sm font-black text-white uppercase tracking-widest font-sans">
              {modeName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] font-sans">
              Question
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary font-sans leading-none">{currentQuestion}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase font-sans">/ {totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-[1.5px] bg-white/5 w-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </header>
  )
}
