'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Bot, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PlayerResult {
  playerId: string
  playerName: string
  answer: string | null
  isCorrect: boolean
  pointsDelta: number
  newScore: number
  isCurrentUser?: boolean
}

interface PostQuestionResultProps {
  correctAnswer: string
  results: PlayerResult[]
  onContinue: () => void
  onAppeal?: (playerId: string, answer: string) => void
  className?: string
}

export function PostQuestionResult({
  correctAnswer,
  results,
  onContinue,
  onAppeal,
  className,
}: PostQuestionResultProps) {
  const currentUserResult = results.find((r) => r.isCurrentUser)
  const canAppeal =
    currentUserResult && !currentUserResult.isCorrect && currentUserResult.answer

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn('flex flex-col gap-6 w-full max-w-md mx-auto', className)}
    >
      {/* Premium Answer Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 text-center backdrop-blur-3xl shadow-2xl"
      >
        {/* Subtle Emerald Glow Backdrop */}
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <div className="h-5 w-5 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/70 font-sans">
              To'g'ri Javob
            </span>
          </div>
          <p className="text-3xl font-black text-white uppercase tracking-tighter mix-blend-difference group-hover:scale-105 transition-transform duration-500">
            {correctAnswer}
          </p>
        </div>
      </motion.div>

      {/* Results List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 px-2 mb-1">
          <div className="h-px flex-1 bg-white/[0.03]" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 font-sans">
            Natijalar
          </span>
          <div className="h-px flex-1 bg-white/[0.03]" />
        </div>

        {results.map((result, index) => (
          <motion.div
            key={result.playerId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={cn(
              'flex items-center gap-4 rounded-[1.5rem] border p-4 transition-all duration-300',
              result.isCurrentUser
                ? 'border-primary/20 bg-primary/[0.03] shadow-[0_0_30px_rgba(var(--primary),0.05)]'
                : 'border-white/5 bg-white/[0.01]'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                result.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : result.answer
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-white/5 border-white/5'
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : result.answer ? (
                <XCircle className="h-5 w-5 text-rose-500" />
              ) : (
                <Clock className="h-5 w-5 text-neutral-600" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'truncate text-sm font-bold tracking-tight font-sans',
                    result.isCurrentUser ? 'text-primary' : 'text-neutral-200'
                  )}
                >
                  {result.playerName}
                </span>
                {result.isCurrentUser && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">(siz)</span>
                )}
              </div>
              <span className="mt-0.5 block truncate text-[10px] font-medium text-neutral-500 font-sans tracking-wide">
                {result.answer
                   ? `"${result.answer}"`
                   : 'Javob bermadi'}
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="shrink-0 flex items-center gap-1.5"
            >
              {result.pointsDelta !== 0 && (
                <div
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-black font-sans',
                    result.pointsDelta > 0
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  )}
                >
                  {result.pointsDelta > 0 ? `+${result.pointsDelta}` : result.pointsDelta}
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Post-result Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4"
      >
        <Button
          onClick={onContinue}
          className="h-16 w-full rounded-[1.5rem] bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl"
        >
          Davom etish
        </Button>
      </motion.div>
    </motion.div>
  )
}
