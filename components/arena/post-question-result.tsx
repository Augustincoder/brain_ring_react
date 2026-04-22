'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col gap-8 w-full max-w-md mx-auto px-4', className)}
    >
      {/* Answer Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-8 text-center backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
        
        <div className="relative">
          <div className="mb-5 flex items-center justify-center gap-2">
            <div className="h-1 w-6 bg-emerald-500/20 rounded-full" />
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-emerald-500/60">
              Correct Answer
            </span>
            <div className="h-1 w-6 bg-emerald-500/20 rounded-full" />
          </div>
          <p className="text-3xl font-bold text-white">
            {correctAnswer}
          </p>
        </div>
      </motion.div>

      {/* Results List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 mb-1">
          <div className="h-[1px] flex-1 bg-white/[0.05]" />
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
            Results
          </span>
          <div className="h-[1px] flex-1 bg-white/[0.05]" />
        </div>

        {results.map((result, index) => (
          <motion.div
            key={result.playerId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300',
              result.isCurrentUser
                ? 'border-primary/20 bg-primary/[0.04]'
                : 'border-white/[0.05] bg-white/[0.02]'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                result.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : result.answer
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-white/[0.03] border-white/[0.05]'
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : result.answer ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-white/30" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'truncate text-sm font-semibold',
                    result.isCurrentUser ? 'text-primary' : 'text-white/90'
                  )}
                >
                  {result.playerName}
                </span>
                {result.isCurrentUser && (
                  <span className="text-[9px] font-medium uppercase tracking-wider text-primary/40">(you)</span>
                )}
              </div>
              <span className="mt-0.5 block truncate text-xs font-medium text-white/40">
                {result.answer
                   ? `"${result.answer}"`
                   : 'No answer'}
              </span>
            </div>

            {result.pointsDelta !== 0 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                className={cn(
                  'shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums',
                  result.pointsDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                )}
              >
                {result.pointsDelta > 0 ? `+${result.pointsDelta}` : result.pointsDelta}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-4"
      >
        <Button
          onClick={onContinue}
          className="h-14 w-full rounded-2xl bg-gradient-to-b from-white to-white/95 text-neutral-950 hover:from-white/95 hover:to-white/90 text-sm font-bold uppercase tracking-[0.1em] transition-all shadow-[0_8px_30px_-8px_rgba(255,255,255,0.3)]"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}