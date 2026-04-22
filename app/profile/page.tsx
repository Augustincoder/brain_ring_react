'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trophy, Flag, Timer, LogOut, Zap, Check, ChevronRight, Flame } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const user = useUserStore()

  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push('/login')
    }
  }, [user.isAuthenticated, router])

  const getUTCDateString = (date: Date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  };

  const streakDates = useMemo(() => {
    const todayStr = getUTCDateString(new Date())
    const activity = [...(user?.activityCalendar || []), "2026-04-18", "2026-04-19", "2026-04-20", "2026-04-21", "2026-04-22", todayStr]
    const start: Date[] = [], mid: Date[] = [], end: Date[] = [], solo: Date[] = [], missed: Date[] = []
    
    const rangeStart = new Date(2026, 2, 1)
    const rangeEnd = new Date(2026, 5, 0)
    const todayL = new Date(); todayL.setHours(0,0,0,0)
    const createdL = user?.createdAt ? new Date(user.createdAt) : new Date(); createdL.setHours(0,0,0,0)

    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const current = new Date(d)
      const dStr = getUTCDateString(current)
      const isMon = current.getDay() === 1
      const isSun = current.getDay() === 0
      
      const p = activity.includes(dStr)
      const n = activity.includes(getUTCDateString(new Date(current.getTime() + 86400000)))
      const pr = activity.includes(getUTCDateString(new Date(current.getTime() - 86400000)))
      
      if (p) {
        const hasPr = pr && !isMon
        const hasN = n && !isSun
        if (hasPr && hasN) mid.push(new Date(current))
        else if (hasPr && !hasN) end.push(new Date(current))
        else if (!hasPr && hasN) start.push(new Date(current))
        else solo.push(new Date(current))
      } else if (current.getTime() < todayL.getTime() && current.getTime() >= createdL.getTime()) {
        missed.push(new Date(current))
      }
    }
    return { start, mid, end, solo, missed }
  }, [user?.activityCalendar, user?.createdAt])

  if (!user.isAuthenticated) return null

  const statCards = [
    { name: "To'g'ri", score: user.totalCorrectAnswers, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'O\'yinlar', score: user.totalGamesPlayed, icon: Flag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: "Tezlik (s)", score: user.averageAnswerTime, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  const calculateLongestStreak = (calendar: string[]) => {
    if (!calendar || calendar.length === 0) return 0;
    const sorted = [...new Set(calendar)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let max = 0, current = 0, lastDate: Date | null = null;
    for (const dateStr of sorted) {
      const date = new Date(dateStr); date.setHours(0,0,0,0);
      if (!lastDate) current = 1;
      else {
        const diff = Math.round((date.getTime() - lastDate.getTime()) / 86400000);
        if (diff === 1) current++; else current = 1;
      }
      max = Math.max(max, current); lastDate = date;
    }
    return max;
  };

  const longestStreak = calculateLongestStreak(user.activityCalendar);

  const getWeeklyActivity = () => {
    const days = ['D','S','C','P','J','S','Y']
    const today = new Date(); today.setHours(0,0,0,0);
    const todayStr = getUTCDateString(today);
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today); monday.setDate(today.getDate() + diff); monday.setHours(0,0,0,0);
    const createdDate = user.createdAt ? new Date(user.createdAt) : new Date(); createdDate.setHours(0,0,0,0);

    return Array.from({length: 7}, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i); d.setHours(0,0,0,0);
      const dateStr = getUTCDateString(d);
      const isPlayed = user.activityCalendar.includes(dateStr);
      const isPast = d < today;
      const isSinceJoined = d >= createdDate;
      const prevD = new Date(d); prevD.setDate(d.getDate() - 1);
      const isPrevPlayed = user.activityCalendar.includes(getUTCDateString(prevD));
      const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
      const isNextPlayed = user.activityCalendar.includes(getUTCDateString(nextD));
      return {
        label: days[i],
        status: isPlayed ? 'played' : (isPast && isSinceJoined ? 'missed' : 'neutral'),
        isStreak: isPlayed && (isPrevPlayed || isNextPlayed),
        isToday: dateStr === todayStr
      };
    });
  };

  const weeklyActivity = getWeeklyActivity();

  return (
    <AppShell>
      <TgSafeArea>
        <div className="relative flex h-full flex-col overflow-hidden bg-black selection:bg-orange-500/30">
          <div className="z-20 flex items-center gap-4 px-6 py-4 bg-black border-b border-white/5">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10" onClick={() => router.push('/lobby')}>
              <ChevronLeft className="h-6 w-6 text-neutral-400" />
            </Button>
            <h1 className="flex-1 text-lg font-black tracking-widest uppercase text-neutral-400">Profil</h1>
          </div>

          <div className="z-10 flex-1 flex flex-col space-y-4 overflow-hidden pt-4 pb-8 px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="px-6 py-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">Current Streak</span>
                    <span className="text-xl font-black text-white leading-none mt-1 uppercase tracking-tight">{user.currentStreak} Days</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-white/5 text-white max-w-[400px] rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">Activity History</DialogTitle>
                    <DialogHeader className="sr-only">
                      <DialogDescription>
                        View your daily gameplay activity and streak history.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-12 flex flex-col items-center bg-[#070707]">
                      <Calendar
                        weekStartsOn={1}
                        className="p-0"
                        modifiers={{
                          streak_start: streakDates.start,
                          streak_mid: streakDates.mid,
                          streak_end: streakDates.end,
                          streak_solo: streakDates.solo,
                          missed: streakDates.missed
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{user.currentStreak}</span>
                  <span className="text-sm font-bold text-neutral-500">days</span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 mb-8 px-1">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2.5">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border relative",
                      day.status === 'played' && "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30 scale-105",
                      day.status === 'missed' && "bg-red-500/5 border-red-500/20 text-red-500",
                      day.status === 'neutral' && "bg-neutral-900/50 border-white/5 text-neutral-700"
                    )}>
                      {day.status === 'played' ? (
                         day.isStreak ? <Flame className="h-4.5 w-4.5 fill-white" /> : <Check className="h-4 w-4 stroke-[3.5]" />
                      ) : day.status === 'missed' ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      ) : (
                        <div className="h-1 w-1 rounded-full bg-current" />
                      )}
                      
                      {day.isToday && day.status !== 'played' && (
                        <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping opacity-20" />
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      day.status === 'played' && "text-orange-500",
                      day.status === 'missed' && "text-red-500/60",
                      day.status === 'neutral' && "text-neutral-700",
                      day.isToday && "text-orange-500/90 font-black"
                    )}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Longest Streak</p>
                  <p className="text-lg font-black text-white">{longestStreak} days</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Games</p>
                  <p className="text-lg font-black text-white">{user.totalGamesPlayed}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-2">
              {statCards.map((stat, i) => (
                <motion.div 
                  key={stat.name} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }} 
                  className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-3 shadow-sm transition-all hover:bg-white/[0.05] group/stat text-center"
                >
                  <div className={`rounded-xl p-2.5 ${stat.bg} shadow-inner mb-2 group-hover/stat:scale-105 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-white leading-none mb-1">{stat.score}</span>
                    <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">{stat.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-red-500/10 bg-red-500/[0.02] text-red-500 hover:bg-red-500/5 hover:text-red-400 transition-all flex items-center justify-center gap-2" 
                onClick={() => { user.logout(); router.push('/login') }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
