'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trophy, Brain } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState<{ id: string, firstName: string, lastName?: string, username?: string, photoUrl?: string } | null>(null)

  const [stats, setStats] = useState({
    brain_ring_score: 0,
    mmr: 0
  })

  useEffect(() => {
    let tgUser = null;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser({
        id: String(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        photoUrl: tgUser.photo_url
      });
    } else {
      const mockId = '1234567';
      setUser({
        id: mockId,
        firstName: 'Test',
        lastName: 'User',
      })
      tgUser = { id: mockId };
    }

    if (tgUser && tgUser.id) {
       const fetchStats = async () => {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('brain_ring_score, mmr')
            .eq('user_id', String(tgUser.id))
            .single()

          if (data && !error) {
             setStats({
                brain_ring_score: data.brain_ring_score || 0,
                mmr: data.mmr || 0
             })
          }
       }
       fetchStats()
    }
  }, [])

  if (!user) return <AppShell><div className="flex-1" /></AppShell>

  const initials = (user.firstName || 'U')[0].toUpperCase();

  const statCards = [
    { name: 'Brain Ring', score: stats.brain_ring_score, icon: Brain, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ]

  return (
    <AppShell>
      <TgSafeArea>
        <div className="relative flex h-full flex-col overflow-hidden bg-background">
          <div className="z-10 flex items-center gap-3 border-b border-border/30 p-4">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl" onClick={() => router.push('/lobby')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="flex-1 text-lg font-semibold">Profil</h1>
          </div>

          <div className="z-10 flex-1 space-y-6 overflow-auto p-4 pb-12">

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/30 bg-card/40 p-6"
            >
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={user.photoUrl} />
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600">
                <Trophy className="h-4 w-4" />
                MMR: {stats.mmr}
              </div>
            </motion.div>

            <div>
              <h3 className="mb-3 px-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Statistika</h3>
              <div className="grid gap-3">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between rounded-xl border ${stat.border} ${stat.bg} p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <span className="text-lg font-bold">{stat.score}</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
