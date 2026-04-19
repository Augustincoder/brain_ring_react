'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Brain, User, Users, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GameMode } from '@/types/game'
import { SUB_MODE_INSTRUCTIONS } from '@/types/game'

interface InstructionModalProps {
  open: boolean
  mode: GameMode | null
  onConfirm: () => void
}

const modeIcons: Record<GameMode, typeof Brain> = {
  solo: User,
  '1v1': Users,
  group: UserPlus,
}

const modeAccentColors: Record<GameMode, string> = {
  solo: 'text-sky-500',
  '1v1': 'text-violet-500',
  group: 'text-emerald-500',
}

const modeAccentBg: Record<GameMode, string> = {
  solo: 'bg-sky-500/10',
  '1v1': 'bg-violet-500/10',
  group: 'bg-emerald-500/10',
}

export function InstructionModal({
  open,
  mode,
  onConfirm,
}: InstructionModalProps) {
  if (!mode) return null

  const instructions = SUB_MODE_INSTRUCTIONS[mode]
  const Icon = modeIcons[mode]
  const accentColor = modeAccentColors[mode]
  const accentBg = modeAccentBg[mode]

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[340px] gap-0 rounded-3xl border-border/30 bg-background/98 p-0 backdrop-blur-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pb-4 pt-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 250, delay: 0.1 }}
            className="mx-auto mb-4"
          >
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl',
                accentBg
              )}
            >
              <Icon className={cn('h-8 w-8', accentColor)} />
            </div>
          </motion.div>

          <DialogTitle className="text-xl font-bold">
            {instructions.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            O&apos;yinni boshlashdan oldin qoidalarni o&apos;qing
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex flex-col gap-2.5">
            {instructions.rules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="flex items-start gap-3"
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    accentBg
                  )}
                >
                  <span className={cn('text-xs font-bold', accentColor)}>
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {rule}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onConfirm}
              className="h-12 w-full gap-2 rounded-xl text-base font-semibold"
            >
              <ShieldCheck className="h-5 w-5" />
              Tushundim
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
