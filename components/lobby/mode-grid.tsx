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
    <div className="grid grid-cols-1 gap-2 p-4">
      {BRAIN_RING_SUB_MODES.map((mode, index) => {
        const Icon = iconMap[mode.icon as keyof typeof iconMap] || Brain

        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            onClick={() => handleSelect(mode.id)}
            className={cn(
              'group relative flex flex-row items-center gap-3',
              'rounded-xl p-3 text-left',
              'bg-card/50 backdrop-blur-sm',
              'border border-border/30',
              'transition-all duration-200',
              'hover:bg-card/70 hover:border-border/50',
              'active:scale-[0.99]'
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                'bg-primary/10 text-primary',
                'transition-transform duration-200',
                'group-hover:scale-105'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-foreground leading-tight">
                {mode.nameUz}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground leading-snug line-clamp-1">
                {mode.descriptionUz}
              </span>
            </div>

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/50">
              <Brain className="h-3 w-3" />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
