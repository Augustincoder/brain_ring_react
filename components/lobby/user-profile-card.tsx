'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Settings, TrendingUp } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useHydrated } from '@/hooks/use-hydrated'

export function UserProfileCard() {
  const router = useRouter()
  const user = useUserStore()
  const hydrated = useHydrated()

  // Defensive fallback for initials during hydration or if username is missing
  const initials = hydrated && user.username ? user.username[0].toUpperCase() : 'U';

  return (
    <div
      onClick={() => router.push('/profile')}
      className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-white/[0.03] transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg">
            <AvatarFallback className="bg-gradient-to-tr from-neutral-900 to-neutral-800 text-sm font-black text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-primary h-3.5 w-3.5 rounded-full border-2 border-[#050505]" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            {hydrated ? (user.username || 'Mehmon') : 'Mehmon'}
          </h2>
          
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
              <Trophy className="h-3 w-3" />
              {hydrated ? user.totalCorrectAnswers : 0}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none">
               🔥 {hydrated ? user.currentStreak : 0}
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-inner group">
         <Settings className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
      </div>
    </div>
  )
}
