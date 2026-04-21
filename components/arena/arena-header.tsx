'use client'

import React from 'react'
import { ChevronLeft, Brain, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
    <header className={cn(
      "w-full bg-background/80 backdrop-blur-md border-b border-border/30 z-50",
      "p-4 pt-6 md:pt-4",
      className
    )}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className={cn(
            "flex items-center gap-2 group transition-all",
            "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center group-active:scale-90 transition-transform">
            <ChevronLeft className="h-6 w-6" />
          </div>
          <span className="hidden sm:inline font-bold text-sm">Chiqish</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {modeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-foreground">
              Savol {currentQuestion}
            </span>
            <span className="text-sm font-bold text-muted-foreground/40">/</span>
            <span className="text-sm font-bold text-muted-foreground/40">
              {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
      
      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-border/20 w-full">
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
