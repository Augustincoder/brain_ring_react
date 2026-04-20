'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trophy, Flag, Timer } from 'lucide-react'
import { useUserStore } from '@/store/user-store'

export default function ProfilePage() {
  const router = useRouter()
  const user = useUserStore()


  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push('/login')
    }
  }, [user.isAuthenticated, router])

  if (!user.isAuthenticated) {
    return null
  }

  const initials = (user.username || 'U')[0].toUpperCase();

  const statCards = [
    { name: "To'g'ri javoblar", score: user.totalCorrectAnswers, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { name: 'Oynalgan o\'yinlar', score: user.totalGamesPlayed, icon: Flag, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: "O'rtacha vaqt (s)", score: user.averageAnswerTime, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ]

  return (
    <AppShell>
      <TgSafeArea>
        <div className="relative flex h-full flex-col overflow-hidden bg-background">
          <div className="z-10 flex items-center gap-3 border-b border-border/30 p-4 bg-card/50 backdrop-blur-sm">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-muted" onClick={() => router.push('/lobby')}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="flex-1 text-xl font-bold">Profil</h1>
          </div>

          <div className="z-10 flex-1 space-y-8 overflow-auto p-6 pb-12 bg-gradient-to-b from-card/30 to-background/50">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-8 shadow-xl shadow-primary/5">
              <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-4xl font-black text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">{user.username}</h2>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-5 py-2 text-sm font-bold text-rose-600 shadow-inner border border-rose-500/10">
                  🔥 Qizg'in Streak: {user.currentStreak} kun
                </div>
              </div>
            </motion.div>

            <div>
              <h3 className="mb-4 px-2 text-sm font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full"></span> Statistika</h3>
              <div className="grid gap-4">
                {statCards.map((stat, i) => (
                  <motion.div key={stat.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`flex items-center justify-between rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm p-6 shadow-sm transition-transform hover:scale-[1.02]`}>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-2xl p-3 ${stat.bg} shadow-inner`}>
                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                      </div>
                      <span className="font-bold text-foreground text-lg">{stat.name}</span>
                    </div>
                    <span className="text-3xl font-black opacity-90">{stat.score}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="pt-8 mb-4">
              <Button variant="destructive" className="w-full h-14 text-lg font-bold rounded-2xl" onClick={() => { user.logout(); router.push('/login') }}>Profildan chiqish</Button>
            </div>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
