'use client'

import { motion } from 'framer-motion'
import { Brain, User, Users, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameMode } from '@/types/game'
import { BRAIN_RING_SUB_MODES } from '@/types/game'
import { triggerHaptic } from '@/lib/telegram'

const iconMap = {
  user: User,
  users: Users,
  'user-plus': UserPlus,
} as const

interface ModeGridProps {
  onSelectMode: (mode: GameMode) => void
}

export function ModeGrid({ onSelectMode }: ModeGridProps) {
  const handleSelect = (mode: GameMode) => {
    triggerHaptic('light')
    onSelectMode(mode)
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-6 py-4">
      {BRAIN_RING_SUB_MODES.map((mode, index) => {
        const Icon = iconMap[mode.icon as keyof typeof iconMap] || Brain

        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => handleSelect(mode.id)}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-3',
              'aspect-square rounded-[2rem] p-6 text-center',
              'bg-white/[0.02] backdrop-blur-2xl',
              'border border-white/5 shadow-2xl',
              'transition-all duration-300',
              'hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02]',
              'active:scale-[0.98]'
            )}
          >
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity rounded-[2rem]" />

            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl',
                'bg-primary/10 text-primary shadow-inner',
                'transition-transform duration-300',
                'group-hover:scale-110 group-hover:rotate-3'
              )}
            >
              <Icon className="h-7 w-7" />
            </div>

            <div className="relative z-10">
              <span className="block text-sm font-black text-white uppercase tracking-widest leading-tight">
                {mode.nameUz}
              </span>
            </div>
            
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
               <Brain className="h-4 w-4 text-white" />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
