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
    <div className="grid grid-cols-1 gap-3 p-4">
      {BRAIN_RING_SUB_MODES.map((mode, index) => {
        const Icon = iconMap[mode.icon as keyof typeof iconMap] || Brain

        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            onClick={() => handleSelect(mode.id)}
            className={cn(
              'group relative flex flex-row items-center gap-4',
              'rounded-2xl p-4 text-left',
              'bg-card/50 backdrop-blur-sm',
              'border border-border/30',
              'transition-all duration-200',
              'hover:bg-card/70 hover:border-border/50',
              'active:scale-[0.99]'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
                'bg-primary/10 text-primary',
                'transition-transform duration-200',
                'group-hover:scale-105'
              )}
            >
              <Icon className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground">
                {mode.nameUz}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {mode.descriptionUz}
              </span>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <Brain className="h-4 w-4 opacity-60" />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
