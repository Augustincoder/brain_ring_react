'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { QuestionDisplay } from '@/components/arena/question-display'
import { ProgressTimer } from '@/components/arena/progress-timer'
import { BuzzerButton } from '@/components/arena/buzzer-button'
import { useTelegram } from '@/hooks/use-telegram'
import { useGameSocket } from '@/hooks/use-game-socket'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'

const AnswerInput = dynamic(
  () => import('@/components/arena/answer-input').then((m) => ({ default: m.AnswerInput })),
  { ssr: false }
)
const PostQuestionResult = dynamic(
  () => import('@/components/arena/post-question-result').then((m) => ({ default: m.PostQuestionResult })),
  { ssr: false }
)
const ArenaHeader = dynamic(
  () => import('@/components/arena/arena-header').then((m) => ({ default: m.ArenaHeader })),
  { ssr: false }
)
const MatchExitModal = dynamic(
  () => import('@/components/arena/match-exit-modal').then((m) => ({ default: m.MatchExitModal })),
  { ssr: false }
)

import { PoolExhaustedModal } from '@/components/arena/pool-exhausted-modal'

export default function BrainRingPage() {
  const router = useRouter()
  const { haptic } = useTelegram()
  const { submitAnswer, forceQuitGame } = useGameSocket()
  
  const [showExitModal, setShowExitModal] = useState(false)

  const userId   = useUserStore((state) => state._id)
  const username = useUserStore((state) => state.username)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  const phase           = useGameStore((state) => state.phase)
  const currentQuestion = useGameStore((state) => state.currentQuestion)
  const questionNumber  = useGameStore((state) => state.questionNumber)
  const totalQuestions  = useGameStore((state) => state.totalQuestions)
  const isSyncing       = useGameStore((state) => state.isSyncing)

  const buzzerWinner    = useGameStore((state) => state.buzzerWinner)
  const buzzerUsername  = useGameStore((state) => state.buzzerUsername)
  const isMyBuzzer      = buzzerWinner === userId
  const chancesLeft     = useGameStore((state) => state.chancesLeft)

  const readingEndTime = useGameStore((state) => state.readingEndTime)
  const answerEndTime  = useGameStore((state) => state.answerEndTime)

  const lastAnswerResult    = useGameStore((state) => state.lastAnswerResult)
  const questionExplanation = useGameStore((state) => state.questionExplanation)

  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(15)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const endTime =
      phase === 'reading'   ? readingEndTime :
      phase === 'answering' ? answerEndTime  :
      phase === 'buzzing'   ? answerEndTime  :
      null

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (!endTime) {
      setTimeRemaining(0)
      return
    }

    const nowMs = Date.now()
    const remainingMs = Math.max(0, endTime - nowMs)
    const totalMs = phase === 'reading' ? 15_000 : 7_000
    setTotalTime(Math.round(totalMs / 1000))
    setTimeRemaining(Math.round(remainingMs / 1000))

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
  }, [phase, readingEndTime, answerEndTime, isAuthenticated, router])

  const handleAnswerSubmit = useCallback((answer: string) => {
    haptic('medium')
    submitAnswer(answer)
  }, [haptic, submitAnswer])

  const handleExitConfirm = useCallback(() => {
    haptic('heavy')
    forceQuitGame()
    router.push('/lobby')
  }, [haptic, forceQuitGame, router])

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
        <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden pt-[72px]">
          <PoolExhaustedModal />
          <div className="absolute inset-0 pointer-events-none transition-all duration-1000">
            <div className={cn(
              "absolute top-[-20%] right-[-10%] w-[80%] h-[60%] blur-[120px] rounded-full transition-all duration-1000",
              phase === 'reading' && "bg-amber-500/10",
              phase === 'buzzing' && "bg-primary/20",
              phase === 'answering' && "bg-red-500/20",
              phase === 'reveal' && "bg-blue-500/10",
              (!phase || phase === 'waiting') && "bg-white/5"
            )} />
            <div className={cn(
              "absolute bottom-[-10%] left-[-20%] w-[100%] h-[50%] blur-[120px] rounded-full transition-all duration-1000",
              phase === 'reading' && "bg-amber-500/5",
              phase === 'buzzing' && "bg-primary/10",
              phase === 'answering' && "bg-red-500/10",
              phase === 'reveal' && "bg-blue-500/5",
              (!phase || phase === 'waiting') && "bg-white/2"
            )} />
          </div>

          <ArenaHeader 
            onBack={() => setShowExitModal(true)}
            currentQuestion={questionNumber}
            totalQuestions={totalQuestions}
          />

          <div className="relative z-20 px-8 py-3 bg-black/40 backdrop-blur-md border-b border-white/5">
            <ProgressTimer 
              timeRemaining={timeRemaining} 
              totalTime={totalTime} 
            />
          </div>

          <div className="flex-1 flex flex-col pt-8 relative z-10 w-full max-w-2xl mx-auto overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 pb-4 overflow-hidden">
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                compact
              />
            </div>

            <div className="h-[40%] min-h-[320px] relative w-full bg-neutral-950/60 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30">
              <AnimatePresence mode="wait">
                {(phase === 'reading' || phase === 'buzzing') && (
                  <motion.div
                    key="buzzer-zone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                  >
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex flex-col items-center gap-3">
                        {phase === 'reading' ? (
                          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse">
                            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] font-sans">
                              Reading Question
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
                              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-sans">
                                Buzz Now
                              </span>
                            </div>
                            <div className="h-4 w-[1.5px] bg-white/10" />
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-sans">Ends:</span>
                               <span className="text-sm font-black text-white font-sans">{chancesLeft}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <BuzzerButton disabled={phase === 'reading' || chancesLeft <= 0} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {phase === 'answering' && (
                  <motion.div
                    key="answer-zone"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute inset-0 z-20 flex flex-col justify-end pointer-events-auto"
                  >
                    {isMyBuzzer ? (
                      <div className="w-full h-full flex flex-col p-8 pt-12">
                        <div className="space-y-1 mb-8">
                          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 w-fit">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] font-sans">
                              Your Turn
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
                          <AnswerInput
                            timeLimit={timeRemaining}
                            onSubmit={handleAnswerSubmit}
                            onTimeUp={() => handleAnswerSubmit('')}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-neutral-950/80 backdrop-blur-2xl z-30">
                        <div className="relative mb-8">
                          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center shadow-inner group">
                             <div className="absolute inset-[-10px] rounded-full border border-white/5 animate-spin-slow" />
                             <Loader2 className="w-10 h-10 text-neutral-500 animate-spin" />
                          </div>
                        </div>
                        <h2 className="text-sm font-black text-neutral-400 uppercase tracking-[0.4em] font-sans mb-2">
                           Player Thinking
                        </h2>
                        <p className="text-2xl font-black text-white uppercase tracking-tight text-center">
                          {buzzerUsername || 'Opponent'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="fixed inset-0 pointer-events-none z-[100]">
            <AnimatePresence>
              {phase === 'results' && lastAnswerResult && (
                <motion.div
                  key="results-zone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-2xl pointer-events-auto"
                >
                  <div className="w-full max-w-lg">
                    {lastAnswerResult.isCorrect === false && chancesLeft > 0 ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                          <X className="h-12 w-12 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-2">Incorrect</h3>
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 w-full mt-4">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Answer given</p>
                          <span className="text-xl font-black text-white uppercase tracking-tight">
                            "{lastAnswerResult.givenAnswer || 'None'}"
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-primary mt-10 uppercase tracking-[0.3em] font-sans animate-pulse">
                          Switching Players...
                        </p>
                      </div>
                    ) : (
                      <PostQuestionResult
                        correctAnswer={lastAnswerResult.correctAnswer || ''}
                        results={[{
                          playerId: lastAnswerResult.userId,
                          playerName: lastAnswerResult.userId === userId ? username : (buzzerUsername || 'Raqib'),
                          answer: lastAnswerResult.givenAnswer || '',
                          isCorrect: lastAnswerResult.isCorrect,
                          pointsDelta: lastAnswerResult.isCorrect ? 1 : 0,
                          newScore: 0,
                          isCurrentUser: lastAnswerResult.userId === userId,
                        }]}
                        onContinue={() => {}}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {phase === 'reveal' && (
                <motion.div
                  key="reveal-zone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-2xl pointer-events-auto"
                >
                  <div className="relative w-full max-w-md group px-4">
                    <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
                    <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[3.5rem] p-10 md:p-14 transform transition-all hover:scale-[1.02] duration-700 text-center">
                      <div className="flex items-center justify-center gap-3 mb-8">
                         <div className="h-px w-8 bg-primary/30" />
                         <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] font-sans">
                           To'g'ri Javob
                         </h2>
                         <div className="h-px w-8 bg-primary/30" />
                      </div>
                      <p className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-10 drop-shadow-2xl">
                        {lastAnswerResult?.correctAnswer}
                      </p>
                      {questionExplanation && (
                        <div className="relative mt-2">
                          <div className="absolute inset-0 bg-primary/5 blur-xl rounded-3xl" />
                          <p className="relative text-[11px] text-neutral-400 font-bold leading-relaxed bg-white/[0.03] p-5 md:p-7 rounded-[2rem] border border-white/5 pointer-events-auto">
                            {questionExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </TgSafeArea>

      <MatchExitModal 
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
      />
    </AppShell>
  )
}