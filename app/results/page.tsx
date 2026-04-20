'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { ScoreSummary } from '@/components/results/score-summary'
import { Button } from '@/components/ui/button'
import { formatBrainRingSessionLabel } from '@/types/game'
import { Crown, AlertCircle, CheckCircle } from 'lucide-react'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useTelegram } from '@/hooks/use-telegram'
import { resetGameSocket } from '@/services/game-socket'

const loadConfetti = () => import('canvas-confetti')

export default function ResultsPage() {
  const router = useRouter()
  const { haptic } = useTelegram()
  const userId = useUserStore((state) => state._id)
  const username = useUserStore((state) => state.username)
  const isAdmin = useUserStore((state) => state.role === 'admin')
  
  const matchResult = useGameStore((state) => state.matchResult)
  const hostId = useGameStore((state) => state.hostId)
  const mode = useGameStore((state) => state.mode)
  const resetGame = useGameStore((state) => state.reset)

  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    resetGameSocket()
  }, [])

  if (!matchResult) {
    return (
      <AppShell className="items-center justify-center">
        <p className="text-muted-foreground font-medium animate-pulse">Natijalar olinmoqda...</p>
      </AppShell>
    )
  }

  let myScore = 0
  let topScore = -1
  let winnerId = ''

  matchResult.participants.forEach(p => {
    if (p.userId === userId) myScore = p.score
    if (p.score > topScore) {
      topScore = p.score
      winnerId = p.userId
    }
  })

  // Group requires you actually win, Solo requires you do decently well (score > 0)
  const isWinner = mode === 'solo' ? myScore > 0 : winnerId === userId

  useEffect(() => {
    if (isWinner && !showConfetti) {
      setShowConfetti(true)
      haptic('success')
      loadConfetti().then((confetti) => {
        const end = Date.now() + 3000
        const interval = setInterval(() => {
          if (Date.now() > end) return clearInterval(interval)
          confetti.default({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#22c55e', '#3b82f6', '#f59e0b'] })
          confetti.default({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#22c55e', '#3b82f6', '#f59e0b'] })
        }, 150)
      })
    }
  }, [isWinner, showConfetti, haptic])

  const handlePlayAgain = () => {
    resetGame()
    router.push('/lobby')
  }

  const handleOverride = async (questionId: string, participantUserId: string) => {
    try {
      const res = await api.post('/api/game/override', {
        gameHistoryId: matchResult.gameHistoryId,
        questionId,
        userId: participantUserId
      })

      if (res.data.success) {
        toast.success("Javob to'g'ri deb qabul qilindi!")
        setOverrides(prev => ({ ...prev, [`${questionId}_${participantUserId}`]: true }))
        haptic('success')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi.')
      haptic('error')
    }
  }

  const canOverride = isAdmin || (hostId === userId)

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
          <div className="relative z-10 p-6 border-b border-border/30 text-center bg-card/80 backdrop-blur shadow-sm">
            <h1 className="text-3xl font-black text-foreground drop-shadow-sm">O'yin yakunlandi</h1>
            <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest">{formatBrainRingSessionLabel(mode)}</p>
          </div>

          <div className="relative z-10 flex-1 overflow-auto p-6 space-y-8 bg-gradient-to-b from-card/30 to-background">
            {isWinner ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center mb-6 border border-amber-500/30 shadow-2xl shadow-amber-500/10 transform rotate-3 hover:rotate-0 transition-transform">
                  <Crown className="h-14 w-14 text-amber-500 fall-animation" />
                </div>
                <h2 className="text-4xl font-black text-foreground mb-2 tracking-tight">Tabriklaymiz!</h2>
                <p className="text-lg text-muted-foreground font-medium bg-muted px-4 py-1.5 rounded-full">Ajoyib natija, <span className="text-primary font-bold">{username}</span>!</p>
              </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mt-4">
                 <h2 className="text-3xl font-black text-foreground mb-3">Yaxshi o'yin!</h2>
                 <p className="text-muted-foreground font-medium text-lg">Keyingi safar omad, {username}!</p>
               </motion.div>
            )}

            <div className="grid gap-4 mt-8">
               {matchResult.participants.map(p => (
                 <div key={p.userId} className="p-5 rounded-2xl bg-card border-border/50 shadow-md flex justify-between items-center transform transition-all hover:-translate-y-1 hover:shadow-lg">
                   <div>
                     <p className="font-bold text-xl">{p.username}</p>
                     <div className="flex gap-3 mt-2 text-xs font-semibold">
                       <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">Yaxshi: {p.correctAnswers}</span>
                       <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">Xato: {p.wrongAnswers}</span>
                     </div>
                   </div>
                   <div className="text-3xl font-black text-primary bg-primary/5 p-3 rounded-xl min-w-16 text-center">{p.score}</div>
                 </div>
               ))}
            </div>

            {canOverride && matchResult.questions.length > 0 && (
              <div className="mt-10 pt-10 border-t border-border/50">
                <div className="flex items-center justify-center gap-3 mb-6 bg-card p-4 rounded-2xl border shadow-sm">
                  <AlertCircle className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-bold text-foreground">Xost Boshqaruvi</h3>
                </div>
                <p className="text-sm text-center text-muted-foreground mb-8 max-w-sm mx-auto font-medium">Noto'g'ri baholangan lexik xatolarini "To'g'ri" ga aylantirish uchun o'z vaqtida chora ko'ring.</p>
                <div className="space-y-6">
                  {matchResult.questions.map((q: any, i) => (
                    <div key={q._id || i} className="p-5 bg-card/60 backdrop-blur rounded-2xl border shadow-sm transition-all hover:border-primary/30">
                      <div className="flex gap-4">
                         <div className="text-2xl font-black text-muted-foreground/30">{i+1}</div>
                         <div className="flex-1">
                            <p className="text-base font-bold text-foreground/90 mb-3">{q.questionText}</p>
                            <p className="text-sm text-emerald-500 font-bold bg-emerald-500/10 inline-flex px-3 py-1 rounded-full mb-4">Javob: {q.correctAnswer}</p>
                            <div className="space-y-3 mt-2">
                               {matchResult.participants.map(p => {
                                 const key = `${q._id}_${p.userId}`
                                 const isOverridden = overrides[key]
                                 return (
                                   <div key={key} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50 shadow-sm">
                                     <span className="text-sm font-bold opacity-80">{p.username}</span>
                                     <Button
                                       variant={isOverridden ? "secondary" : "outline"}
                                       size="sm"
                                       className={isOverridden ? "text-emerald-600 bg-emerald-500/20 hover:bg-emerald-500/20 font-bold border-0 shadow-inner" : "font-semibold bg-background hover:bg-muted"}
                                       onClick={() => handleOverride(q._id, p.userId)}
                                       disabled={isOverridden}
                                     >
                                       {isOverridden ? <><CheckCircle className="w-4 h-4 mr-1.5"/> Tasdiqlandi</> : "To'g'ri deyish"}
                                     </Button>
                                   </div>
                                 )
                               })}
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative z-20 p-6 bg-card/90 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
            <Button onClick={handlePlayAgain} className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/25" size="lg">
              Yangi o'yin boshlash
            </Button>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}