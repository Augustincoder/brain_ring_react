'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Zap, Trophy } from 'lucide-react'
import type { Question } from '@/types/game'

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  className?: string
  compact?: boolean
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  className,
  compact,
}: QuestionDisplayProps) {

  const textLength = question.text.length
  
  // Adjusted font sizing for maximum space
  const getFontSize = () => {
    if (textLength > 400) return 'text-base md:text-lg leading-relaxed tracking-wide'
    if (textLength > 250) return 'text-lg md:text-xl leading-relaxed'
    if (textLength > 150) return 'text-xl md:text-2xl'
    if (textLength > 80)  return 'text-2xl md:text-3xl'
    return 'text-3xl md:text-5xl'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center px-4 w-full h-full max-h-full overflow-hidden', className)}
    >
      {/* Expanded Cinematic Question centerpiece */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden group flex flex-col justify-center">
        {/* Glow behind text */}
        <div className="absolute inset-x-8 inset-y-12 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="h-full w-full overflow-y-auto custom-scrollbar px-2 flex flex-col justify-center relative z-10">
          <motion.h2
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className={cn(
              'font-bold text-white text-center text-balance font-sans drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]',
              getFontSize()
            )}
          >
            {question.text}
          </motion.h2>
        </div>

        {/* Scroll Masks */}
        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
      </div>
    </motion.div>
  )
}
