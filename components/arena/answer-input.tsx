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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full flex flex-col items-center justify-center px-6", className)}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex items-center gap-3">
        <div className="relative flex-1 group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500 rounded-2xl" />
          
          <Input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className={cn(
              "relative w-full h-14 md:h-16 text-lg md:text-xl pl-6 md:pl-7 font-medium text-white",
              "bg-white/[0.03] border-white/[0.06] rounded-2xl",
              "placeholder:text-white/20 focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/10",
              "transition-all duration-300"
            )}
            autoFocus
            autoComplete="off"
            disabled={disabled || timeLimit <= 0}
          />
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            disabled={!answer.trim() || disabled || timeLimit <= 0}
            className={cn(
              "h-14 w-14 md:h-16 md:w-16 rounded-2xl p-0 shrink-0",
              "bg-gradient-to-b from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80",
              "text-neutral-950 shadow-[0_8px_30px_-8px_rgba(var(--primary-rgb),0.4)]",
              "disabled:opacity-20 disabled:shadow-none transition-all duration-300"
            )}
          >
            <ArrowRight className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}