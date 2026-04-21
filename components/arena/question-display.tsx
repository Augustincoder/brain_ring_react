'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
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
  
  // Dynamic font sizing based on length
  const getFontSize = () => {
    if (textLength > 300) return 'text-base md:text-lg'
    if (textLength > 150) return 'text-lg md:text-xl'
    return compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center gap-3 px-4 w-full h-full max-h-full overflow-hidden', className)}
    >
      {/* Question counter */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded">
          Savol {questionNumber} / {totalQuestions}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-black uppercase tracking-wider">
          {question.category}
        </span>
      </div>

      {/* Question text with scroll area */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar px-2 flex flex-col justify-center py-2">
        <motion.h2
          key={question.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(
            'font-bold leading-relaxed text-foreground text-center text-balance transition-all duration-300',
            getFontSize()
          )}
        >
          {question.text}
        </motion.h2>
      </div>

      {/* Difficulty badge */}
      <div className={cn(
        'shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
        question.difficulty === 'easy' && 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        question.difficulty === 'medium' && 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        question.difficulty === 'hard' && 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      )}>
        {question.difficulty === 'easy' && 'Oson'}
        {question.difficulty === 'medium' && 'O\'rta'}
        {question.difficulty === 'hard' && 'Qiyin'}
        <span className="mx-2 opacity-20">|</span>
        {question.points} ball
      </div>
    </motion.div>
  )
}
