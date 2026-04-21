'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trophy, Flag, Timer, LogOut, Zap, Check, ChevronRight } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'

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
    { name: "To'g'ri", score: user.totalCorrectAnswers, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'O\'yinlar', score: user.totalGamesPlayed, icon: Flag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: "Tezlik (s)", score: user.averageAnswerTime, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  const calculateLongestStreak = (calendar: string[]) => {
    if (!calendar || calendar.length === 0) return 0;
    const sorted = [...new Set(calendar)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let max = 0;
    let current = 0;
    let lastDate: Date | null = null;
    for (const dateStr of sorted) {
      const date = new Date(dateStr);
      date.setHours(0,0,0,0);
      if (!lastDate) {
        current = 1;
      } else {
        const diff = Math.round((date.getTime() - lastDate.getTime()) / 86400000);
        if (diff === 1) current++;
        else current = 1;
      }
      max = Math.max(max, current);
      lastDate = date;
    }
    return max;
  };

  const longestStreak = calculateLongestStreak(user.activityCalendar);

  // Get current week activity (Mon-Sun)
  const getWeeklyActivity = () => {
    const days = ['D','S','C','P','J','S','Y'];
    const today = new Date();
    const day = today.getDay(); // 0 is Sun, 1 is Mon
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        label: days[i],
        active: user.activityCalendar.includes(dateStr),
        isToday: dateStr === new Date().toISOString().split('T')[0]
      };
    });
  };

  const weeklyActivity = getWeeklyActivity();

  return (
    <AppShell>
      <TgSafeArea>
        <div className="relative flex h-full flex-col overflow-hidden bg-[#050505]">
          {/* Background Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />

          <div className="z-20 flex items-center gap-4 px-6 py-4 bg-neutral-950/40 backdrop-blur-xl border-b border-white/5">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10" onClick={() => router.push('/lobby')}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="flex-1 text-lg font-black tracking-widest uppercase text-neutral-400">Profil</h1>
          </div>

          <div className="z-10 flex-1 flex flex-col space-y-3 overflow-hidden pt-4 pb-8 px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="px-6 py-6 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                  <span className="text-sm font-black text-white tracking-widest uppercase font-sans">Streak Days Count</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-sm font-bold text-neutral-500 hover:text-white transition-colors flex items-center gap-1.5 font-sans px-2 py-1 hover:bg-white/5 rounded-lg">
                      View Details <ChevronRight className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined} className="bg-neutral-950 border-neutral-800 text-white max-w-[480px] rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="pt-10 px-10">
                      <DialogTitle className="text-center font-black uppercase tracking-[0.3em] text-sm text-neutral-500 font-sans">Activity Calendar</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 flex justify-center pb-12">
                      <Calendar
                        mode="multiple"
                        selected={user.activityCalendar.map(d => new Date(d))}
                        className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 scale-110 origin-center w-full max-w-sm"
                        classNames={{
                          day: "h-10 w-10 flex items-center justify-center p-1",
                          selected: "bg-primary text-primary-foreground rounded-full"
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

              <div className="flex justify-between items-center mb-8 px-1">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      day.active 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-neutral-900 text-neutral-700'
                    }`}>
                      {day.active ? <Check className="h-4 w-4 stroke-[3]" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={`text-[10px] font-black ${day.active ? 'text-emerald-500' : 'text-neutral-700'}`}>
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
