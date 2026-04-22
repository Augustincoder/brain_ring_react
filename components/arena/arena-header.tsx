'use client'

import React from 'react'
import { X } from 'lucide-react'
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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-2xl border-b border-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all" 
              onClick={onBack}
            >
              <X className="h-4 w-4 text-white/70" />
            </Button>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
              Arena
            </span>
            <h1 className="text-sm font-semibold text-white/90">
              {modeName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
              Question
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tabular-nums">{currentQuestion}</span>
              <span className="text-xs font-medium text-white/40">/ {totalQuestions}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-0 left-0 h-[1px] bg-white/[0.03] w-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
          initial={{ width: 0 }}
          animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </header>
  )
}