'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Settings, TrendingUp } from 'lucide-react'
import { useUserStore } from '@/store/user-store'

export function UserProfileCard() {
  const router = useRouter()
  const user = useUserStore()

  const initials = (user.username || 'U')[0].toUpperCase();

  return (
    <div
      onClick={() => router.push('/profile')}
      className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">{user.username || 'Mehmon'}</h2>
          
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Trophy className="h-3.5 w-3.5" />
              {user.totalCorrectAnswers} To'g'ri
            </div>
            {user.role === 'admin' && (
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                 Admin
              </div>
            )}
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-500">
               🔥 {user.currentStreak} k.
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2.5 rounded-xl bg-card border shadow-sm">
         <Settings className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  )
}
