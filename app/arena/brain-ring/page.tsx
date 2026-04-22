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
      <AppShell className="items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white/90 mb-1">Reconnecting...</p>
            <p className="text-xs text-white/40">Syncing game state</p>
          </div>
        </motion.div>
      </AppShell>
    )
  }

  if (!currentQuestion) {
    return (
      <AppShell className="items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-white/60 font-medium animate-pulse text-sm">Loading...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex flex-col h-full bg-black relative overflow-hidden pt-[72px]">
          <PoolExhaustedModal />
          
          {/* Ambient Glow Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className={cn(
                "absolute top-0 right-0 w-[70%] h-[50%] blur-[120px] rounded-full transition-all duration-1000",
                phase === 'reading' && "bg-amber-500/[0.08]",
                phase === 'buzzing' && "bg-primary/[0.12]",
                phase === 'answering' && "bg-red-500/[0.12]",
                phase === 'reveal' && "bg-emerald-500/[0.08]",
                (!phase || phase === 'waiting') && "bg-white/[0.02]"
              )}
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className={cn(
                "absolute bottom-0 left-0 w-[60%] h-[40%] blur-[100px] rounded-full transition-all duration-1000",
                phase === 'reading' && "bg-amber-500/[0.05]",
                phase === 'buzzing' && "bg-primary/[0.08]",
                phase === 'answering' && "bg-red-500/[0.08]",
                phase === 'reveal' && "bg-emerald-500/[0.05]",
                (!phase || phase === 'waiting') && "bg-white/[0.01]"
              )}
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <ArenaHeader 
            onBack={() => setShowExitModal(true)}
            currentQuestion={questionNumber}
            totalQuestions={totalQuestions}
          />

          <div className="relative z-20 px-6 py-4 bg-black/20 backdrop-blur-xl border-b border-white/[0.02]">
            <ProgressTimer 
              timeRemaining={timeRemaining} 
              totalTime={totalTime} 
            />
          </div>

          <div className="flex-1 flex flex-col pt-6 relative z-10 w-full max-w-2xl mx-auto overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 pb-4 overflow-hidden">
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                compact
              />
            </div>

            <div className="h-[40%] min-h-[320px] relative w-full bg-black/40 backdrop-blur-2xl border-t border-white/[0.03] z-30">
              <AnimatePresence mode="wait">
                {(phase === 'reading' || phase === 'buzzing') && (
                  <motion.div
                    key="buzzer-zone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-10">
                      <div className="flex flex-col items-center gap-4">
                        {phase === 'reading' ? (
                          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/[0.06] border border-amber-500/10">
                            <Loader2 className="h-3.5 w-3.5 text-amber-500/70 animate-spin" />
                            <span className="text-[9px] font-medium text-amber-500/70 uppercase tracking-[0.3em]">
                              Reading
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-5">
                            <div className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/10">
                              <span className="text-[9px] font-medium text-primary/80 uppercase tracking-[0.3em]">
                                Buzz Now
                              </span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/[0.06]" />
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-medium text-white/30 uppercase tracking-wider">Chances:</span>
                               <span className="text-sm font-bold text-white/90 tabular-nums">{chancesLeft}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <BuzzerButton disabled={phase === 'reading' || chancesLeft <= 0} />
                    </div>
                  </motion.div>
                )}

                {phase === 'answering' && (
                  <motion.div
                    key="answer-zone"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-20 flex flex-col justify-end"
                  >
                    {isMyBuzzer ? (
                      <div className="w-full h-full flex flex-col p-6 pt-10">
                        <div className="mb-6">
                          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/10 w-fit">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-medium text-red-500/80 uppercase tracking-[0.3em]">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-2xl">
                        <div className="relative mb-8">
                          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                             <div className="absolute inset-[-8px] rounded-full border border-white/[0.03] animate-spin-slow" />
                             <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                          </div>
                        </div>
                        <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.2em] mb-2">
                           Thinking
                        </h2>
                        <p className="text-xl font-bold text-white/90">
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
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-2xl pointer-events-none"
                >
                  <div className="w-full max-w-lg pointer-events-auto">
                    {lastAnswerResult.isCorrect === false && chancesLeft > 0 ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
                          <X className="h-10 w-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-500 mb-4">Incorrect</h3>
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 w-full mt-4">
                          <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mb-2">Given Answer</p>
                          <span className="text-lg font-semibold text-white/90">
                            "{lastAnswerResult.givenAnswer || 'None'}"
                          </span>
                        </div>
                        <p className="text-[9px] font-medium text-primary/60 mt-10 uppercase tracking-[0.25em] animate-pulse">
                          Next Player...
                        </p>
                      </div>
                    ) : (
                      <PostQuestionResult
                        correctAnswer={lastAnswerResult.correctAnswer || ''}
                        results={[{
                          playerId: lastAnswerResult.userId,
                          playerName: lastAnswerResult.userId === userId ? username : (buzzerUsername || 'Opponent'),
                          answer: lastAnswerResult.givenAnswer || '',
                          isCorrect: lastAnswerResult.isCorrect,
                          pointsDelta: lastAnswerResult.isCorrect ? 1 : 0,
                          newScore: 0,
                          isCurrentUser: lastAnswerResult.userId === userId,
                        }]}
                        onContinue={() => {
                          if (useGameStore.getState().phase === 'results' || useGameStore.getState().phase === 'reveal') {
                             useGameStore.setState({ phase: 'reading' }) // Fallback safeguard
                          }
                        }}
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
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-2xl pointer-events-none"
                >
                  <div className="relative w-full max-w-md px-4 pointer-events-auto">
                    <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full" />
                    <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-10 md:p-12 text-center">
                      <div className="flex items-center justify-center gap-3 mb-8">
                         <div className="h-[1px] w-8 bg-primary/20" />
                         <h2 className="text-[9px] font-medium text-primary/70 uppercase tracking-[0.3em]">
                           Correct Answer
                         </h2>
                         <div className="h-[1px] w-8 bg-primary/20" />
                      </div>
                      <p className="text-4xl md:text-5xl font-bold text-white mb-10">
                        {lastAnswerResult?.correctAnswer}
                      </p>
                      {questionExplanation && (
                        <div className="relative mt-2">
                          <div className="absolute inset-0 bg-primary/3 blur-xl rounded-3xl" />
                          <p className="relative text-xs text-white/50 font-medium leading-relaxed bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
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