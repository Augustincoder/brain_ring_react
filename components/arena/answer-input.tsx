'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { triggerHaptic } from '@/lib/telegram'

interface AnswerInputProps {
  timeLimit: number
  onSubmit: (answer: string) => void
  onTimeUp: () => void
  disabled?: boolean
  className?: string
}

export function AnswerInput({
  timeLimit,
  onSubmit,
  onTimeUp,
  disabled,
  className,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus()
    }, 150)
    return () => clearTimeout(focusTimer)
  }, [])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!answer.trim() || disabled) return
    
    triggerHaptic('medium')
    onSubmit(answer.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center px-4", className)}>
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex items-center gap-3">
        <div className="relative flex-1 group">
          {/* Minimalist outer focus glow */}
          <div className="absolute -inset-[1px] bg-primary/20 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          
          <Input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Javobni yozing..."
            className={cn(
              "relative w-full h-16 md:h-24 text-xl md:text-3xl text-left pl-8 md:pl-10 font-bold tracking-tight text-white",
              "bg-black border border-zinc-800/50 rounded-2xl md:rounded-[2.5rem]",
              "placeholder:text-zinc-700/50 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all duration-500 shadow-2xl",
              "selection:bg-primary selection:text-neutral-950"
            )}
            autoFocus
            autoComplete="off"
            disabled={disabled || timeLimit <= 0}
          />
        </div>

        <Button
          type="submit"
          disabled={!answer.trim() || disabled || timeLimit <= 0}
          className={cn(
            "h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2.5rem] p-0 transition-all active:scale-95 shrink-0",
            "bg-gradient-to-br from-primary to-primary/80 hover:brightness-110 text-neutral-950 shadow-[0_20px_50px_-12px_rgba(var(--primary),0.3)]",
            "disabled:opacity-20 disabled:grayscale disabled:shadow-none"
          )}
        >
          <ArrowRight className="h-6 w-6 md:h-10 md:w-10" />
        </Button>
      </form>
    </div>
  )
}
