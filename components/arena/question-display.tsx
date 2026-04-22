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
  
  const getFontSize = () => {
    if (textLength > 400) return 'text-base md:text-lg leading-relaxed'
    if (textLength > 250) return 'text-lg md:text-xl leading-relaxed'
    if (textLength > 150) return 'text-xl md:text-2xl leading-relaxed'
    if (textLength > 80)  return 'text-2xl md:text-3xl leading-relaxed'
    return 'text-3xl md:text-4xl leading-relaxed'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn('flex flex-col items-center justify-center w-full h-full', className)}
    >
      <div className="flex-1 w-full flex flex-col justify-center relative overflow-hidden">
        <div className="h-full w-full overflow-y-auto custom-scrollbar px-6 flex flex-col justify-center">
          <motion.h2
            key={question.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'font-semibold text-white text-center text-balance',
              getFontSize()
            )}
          >
            {question.text}
          </motion.h2>
        </div>

        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}