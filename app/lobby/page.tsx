'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { UserProfileCard } from '@/components/lobby/user-profile-card'
import { ModeGrid } from '@/components/lobby/mode-grid'
import { useGameStore } from '@/store/game-store'
import type { GameMode } from '@/types/game'

export default function LobbyPage() {
  const router = useRouter()
  const setMode = useGameStore((state) => state.setMode)

  const handleSelectMode = (mode: GameMode) => {
    setMode(mode)
    router.push('/matchmaking')
  }

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex h-full flex-col bg-background relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="border-b border-border/30 bg-card/50 backdrop-blur-md relative z-10"
          >
            <UserProfileCard />
          </motion.div>

          <div className="flex-1 overflow-auto relative z-10 w-full max-w-2xl mx-auto flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="p-6 md:p-8"
            >
              <h2 className="mb-2 text-3xl font-black text-foreground drop-shadow-sm flex items-center gap-3">
                <span className="text-4xl text-primary">🧠</span> Brain Ring
              </h2>
              <p className="text-base text-muted-foreground font-medium max-w-sm">
                O&apos;yin turini tanlang. O'z mahoratingizni sinang, raqobatda qatnashing yoki do'stlar bilan zavqlaning!
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="px-4 pb-8"
            >
              <ModeGrid onSelectMode={handleSelectMode} />
            </motion.div>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
