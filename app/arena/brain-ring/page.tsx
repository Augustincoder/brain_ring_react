'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { QuestionDisplay } from '@/components/arena/question-display'
import { ProgressTimer } from '@/components/arena/progress-timer'
import { BuzzerButton } from '@/components/arena/buzzer-button'
import { useTelegram } from '@/hooks/use-telegram'
import { useGameSocket } from '@/hooks/use-game-socket'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'

const AnswerInput = dynamic(
  () => import('@/components/arena/answer-input').then((m) => ({ default: m.AnswerInput })),
  { ssr: false }
)
const PostQuestionResult = dynamic(
  () => import('@/components/arena/post-question-result').then((m) => ({ default: m.PostQuestionResult })),
  { ssr: false }
)

export default function BrainRingPage() {
  const router = useRouter()
  const { haptic } = useTelegram()
  const { buzzIn, submitAnswer } = useGameSocket()

  const userId   = useUserStore((state) => state._id)
  const username = useUserStore((state) => state.username)

  const phase           = useGameStore((state) => state.phase)
  const currentQuestion = useGameStore((state) => state.currentQuestion)
  const questionNumber  = useGameStore((state) => state.questionNumber)
  const totalQuestions  = useGameStore((state) => state.totalQuestions)
  const isSyncing       = useGameStore((state) => state.isSyncing)

  const buzzerWinner  = useGameStore((state) => state.buzzerWinner)
  const isMyBuzzer    = buzzerWinner === userId
  const chancesLeft   = useGameStore((state) => state.chancesLeft)

  // ── PILLAR 3 groundwork: read absolute epoch timestamps ──────────────────
  const readingEndTime = useGameStore((state) => state.readingEndTime)
  const answerEndTime  = useGameStore((state) => state.answerEndTime)

  const lastAnswerResult    = useGameStore((state) => state.lastAnswerResult)
  const questionExplanation = useGameStore((state) => state.questionExplanation)

  // ── Server-authoritative visual timer ────────────────────────────────────
  // We only render time — we NEVER emit anything when it hits zero.
  // The server drives all phase transitions.
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(15)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Pick the relevant endTime for the current phase
    const endTime =
      phase === 'reading'   ? readingEndTime :
      phase === 'answering' ? answerEndTime  :
      phase === 'buzzing'   ? answerEndTime  :
      null

    // Cancel any running animation loop
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (!endTime) {
      setTimeRemaining(0)
      return
    }

    // Snapshot the total duration for the progress bar
    const nowMs = Date.now()
    const remainingMs = Math.max(0, endTime - nowMs)
    const totalMs = phase === 'reading' ? 15_000 : 7_000
    setTotalTime(Math.round(totalMs / 1000))
    setTimeRemaining(Math.round(remainingMs / 1000))

    // requestAnimationFrame loop — updates every ~100ms, purely visual
    let lastTick = -1
    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      if (left !== lastTick) {
        lastTick = left
        setTimeRemaining(left)
      }
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Time is up visually — UI passively shows "00" and waits for server.
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [phase, readingEndTime, answerEndTime])

  // ── PILLAR 2 groundwork: plain emit, no optimistic store write ───────────
  // The server is the authority. useBuzzer hook (Pillar 2) will add
  // optimistic lock + throttle on top of this.
  const handleBuzzerClick = useCallback(() => {
    haptic('impact')
    buzzIn()
  }, [haptic, buzzIn])

  const handleAnswerSubmit = useCallback((answer: string) => {
    haptic('impact')
    submitAnswer(answer)
  }, [haptic, submitAnswer])

  // ── PILLAR 1: Full-screen syncing guard ──────────────────────────────────
  // Shown on refresh while waiting for server to re-deliver game state.
  // NEVER shown during normal navigation (isSyncing starts as false).
  if (isSyncing) {
    return (
      <AppShell className="items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card/60 backdrop-blur border border-border/30 shadow-2xl"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <p className="text-base font-bold text-foreground">O'yinga qayta ulanmoqda...</p>
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Server holati tiklanmoqda. Bir lahza kuting.
          </p>
        </motion.div>
      </AppShell>
    )
  }

  // Normal waiting state (first load, before first question arrives)
  if (!currentQuestion) {
    return (
      <AppShell className="items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground font-medium animate-pulse">Server kutilmoqda...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/80 backdrop-blur-md z-10 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
                Brain Ring
              </span>
            </div>
            {(phase === 'reading' || phase === 'answering' || phase === 'buzzing') && (
              <ProgressTimer timeRemaining={timeRemaining} totalTime={totalTime} variant="bar" />
            )}
          </div>

          <div className="flex-1 flex flex-col relative z-0">
            {/* Question */}
            <div className="flex-1 flex flex-col justify-center p-6 border-b border-border/10 bg-gradient-to-b from-transparent to-card/20 shadow-inner">
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                compact
              />
            </div>

            {/* Action Zone */}
            <div className="h-[50%] lg:h-[40%] relative w-full bg-card/40">
              <AnimatePresence mode="wait">

                {/* READING / BUZZING */}
                {(phase === 'reading' || phase === 'buzzing') && (
                  <motion.div
                    key="buzzer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                  >
                    {phase === 'reading' ? (
                      <p className="text-sm font-bold text-amber-500 animate-pulse mb-6 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                        Savol o'qilmoqda... Kuting
                      </p>
                    ) : (
                      <p className="text-sm text-foreground/70 mb-6 font-bold tracking-widest uppercase bg-card/60 backdrop-blur px-4 py-1.5 rounded-full border border-border/50">
                        Urinishlar: <span className="text-primary">{chancesLeft}</span>
                      </p>
                    )}
                    <BuzzerButton disabled={phase === 'reading' || chancesLeft <= 0} />
                  </motion.div>
                )}

                {/* ANSWERING */}
                {phase === 'answering' && (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 z-20 bg-background/90 backdrop-blur flex flex-col justify-end"
                  >
                    {isMyBuzzer ? (
                      <div className="w-full h-full lg:max-w-md lg:mx-auto lg:h-auto rounded-t-3xl sm:rounded-3xl bg-card lg:border border-t border-border shadow-2xl p-6 pb-12 flex flex-col justify-center">
                        <div className="text-center mb-8">
                          <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2 animate-pulse flex justify-center items-center gap-2">
                            <span>🔴</span> Sizning navbatingiz
                          </p>
                          <h3 className="text-2xl font-black text-foreground drop-shadow-sm">
                            Javobingizni kiriting
                          </h3>
                        </div>
                        <div>
                          <AnswerInput
                            timeLimit={timeRemaining}
                            onSubmit={handleAnswerSubmit}
                            onTimeUp={() => handleAnswerSubmit('')}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur-md z-30">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner ring-4 ring-primary/5">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                        <p className="text-2xl font-bold text-foreground mb-2">
                          {buzzerWinner ? `${useGameStore.getState().buzzerUsername} o'ylamoqda...` : 'Raqib o\'ylamoqda...'}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                          Kutib turing
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* RESULTS */}
                {phase === 'results' && lastAnswerResult && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-background flex flex-col items-center justify-center"
                  >
                    {lastAnswerResult.isCorrect === false && chancesLeft > 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 w-full max-w-sm">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-rose-500/20">
                          <span className="text-3xl">❌</span>
                        </div>
                        <h3 className="text-xl font-black text-rose-500 mb-2">Noto'g'ri javob</h3>
                        <div className="flex flex-col items-center text-foreground font-medium bg-card w-full py-4 rounded-2xl border border-border mt-4 shadow-sm">
                          <p className="text-sm text-muted-foreground mb-1">
                            {lastAnswerResult.userId === userId ? 'Sizning javobingiz:' : 'Raqib javobi:'}
                          </p>
                          <span className="text-xl font-black text-foreground">
                            "{lastAnswerResult.givenAnswer || 'Javob yoq'}"
                          </span>
                        </div>
                        <p className="text-sm text-primary mt-8 font-bold animate-pulse">
                          Navbat boshqalarga o'tadi...
                        </p>
                      </div>
                    ) : (
                      <PostQuestionResult
                        correctAnswer={lastAnswerResult.correctAnswer || ''}
                        results={[{
                          playerId: lastAnswerResult.userId,
                          playerName: lastAnswerResult.userId === userId ? username : 'Raqib',
                          answer: lastAnswerResult.givenAnswer || '',
                          isCorrect: lastAnswerResult.isCorrect,
                          pointsDelta: lastAnswerResult.isCorrect ? 1 : 0,
                          newScore: 0,
                          isCurrentUser: lastAnswerResult.userId === userId,
                        }]}
                        onContinue={() => {}}
                      />
                    )}
                  </motion.div>
                )}

                {/* REVEAL */}
                {phase === 'reveal' && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-background flex flex-col p-8 items-center justify-center text-center"
                  >
                    <div className="w-full max-w-md bg-card border shadow-xl rounded-3xl p-8 transform transition-all hover:scale-105">
                      <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
                        To'g'ri javob
                      </h2>
                      <p className="text-3xl font-black text-foreground mb-6 drop-shadow-md">
                        {lastAnswerResult?.correctAnswer}
                      </p>
                      {questionExplanation && (
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed bg-muted/50 p-4 rounded-xl">
                          {questionExplanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}