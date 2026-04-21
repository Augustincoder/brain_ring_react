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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className={cn('flex flex-col gap-4 p-4', className)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-center"
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">To&apos;g&apos;ri javob</span>
        </div>
        <p className="text-lg font-bold text-foreground">{correctAnswer}</p>
      </motion.div>

      <div className="flex flex-col gap-2">
        <span className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Natijalar
        </span>
        {results.map((result, index) => (
          <motion.div
            key={result.playerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3',
              result.isCurrentUser
                ? 'border-primary/20 bg-primary/5'
                : 'border-border/20 bg-card/50'
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                result.isCorrect
                  ? 'bg-emerald-500/10'
                  : result.answer
                    ? 'bg-rose-500/10'
                    : 'bg-muted/30'
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : result.answer ? (
                <XCircle className="h-5 w-5 text-rose-500" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span
                  className={cn(
                    'truncate text-sm font-semibold',
                    result.isCurrentUser ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {result.playerName}
                  {result.isCurrentUser && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(siz)</span>
                  )}
                </span>
              </div>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {result.answer
                  ? `"${result.answer}"`
                  : 'Javob bermadi'}
              </span>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
              className="shrink-0"
            >
              {result.pointsDelta !== 0 && (
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-sm font-bold',
                    result.pointsDelta > 0
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-rose-500/10 text-rose-500'
                  )}
                >
                  {result.pointsDelta > 0 ? `+${result.pointsDelta}` : result.pointsDelta}
                </span>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {canAppeal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-2"
        >
          {/* <Button
            variant="outline"
            onClick={() => {
              import('@/services/game-socket').then(({ getGameSocket }) => {
                getGameSocket().requestAIRecheck('current', currentUserResult.playerId, currentUserResult.answer!)
              })
              onAppeal?.(currentUserResult.playerId, currentUserResult.answer!)
            }}
            className="h-11 w-full gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
          >
            <Bot className="h-4 w-4" />
            🤖 AI bilan tekshirish
          </Button> */}
          <p className="px-2 text-center text-[11px] leading-relaxed text-muted-foreground/70">
            Eslatma: Faqat imlo xatolari yoki muqobil to&apos;g&apos;ri javoblar uchun.
            Boshqa hollarda natija o&apos;zgarmaydi.
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onContinue}
          className="h-12 w-full rounded-xl text-base font-medium"
        >
          Davom etish
        </Button>
      </motion.div>
    </motion.div>
  )
}
