'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { UserProfileCard } from '@/components/lobby/user-profile-card'
import { ModeGrid } from '@/components/lobby/mode-grid'
import { useGameStore } from '@/store/game-store'
import type { GameMode } from '@/types/game'

const ARENA_PATH = '/arena/brain-ring'

export default function LobbyPage() {
  const router = useRouter()
  const setRoom = useGameStore((state) => state.setRoom)

  const handleSelectMode = (mode: GameMode) => {
    const roomId = `room_${Date.now()}`
    setRoom(roomId, mode)

    if (mode === 'solo') {
      router.push(ARENA_PATH)
    } else {
      router.push('/matchmaking')
    }
  }

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex h-full flex-col">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-border/30"
          >
            <UserProfileCard />
          </motion.div>

          <div className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="p-4"
            >
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                Brain Ring
              </h2>
              <p className="text-sm text-muted-foreground">
                O&apos;yin turini tanlang — yakka mashq, 1v1 yoki do&apos;stlar bilan xona
              </p>
            </motion.div>

            <ModeGrid onSelectMode={handleSelectMode} />
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
