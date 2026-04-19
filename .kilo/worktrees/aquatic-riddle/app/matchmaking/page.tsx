'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { PulseLoader } from '@/components/matchmaking/pulse-loader'
import { OpponentFound } from '@/components/matchmaking/opponent-found'
import { InstructionModal } from '@/components/lobby/instruction-modal'
import { RoomInvite } from '@/components/lobby/room-invite'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { useTelegram } from '@/hooks/use-telegram'
import { BRAIN_RING_SUB_MODES, formatBrainRingSessionLabel } from '@/types/game'
import type { Player } from '@/types/user'
import { X } from 'lucide-react'

const ARENA_PATH = '/arena/brain-ring'

const mockOpponents: Player[] = [
  { id: 'opp1', username: 'Jasur', avatar: '', mmr: 1150, gamesPlayed: 45, wins: 28, losses: 17, isReady: true, score: 0, connected: true },
  { id: 'opp2', username: 'Malika', avatar: '', mmr: 980, gamesPlayed: 32, wins: 18, losses: 14, isReady: true, score: 0, connected: true },
  { id: 'opp3', username: 'Sardor', avatar: '', mmr: 1250, gamesPlayed: 67, wins: 42, losses: 25, isReady: true, score: 0, connected: true },
]

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function MatchmakingPage() {
  const router = useRouter()
  const { showBack, hideBack, haptic } = useTelegram()
  const [opponentFound, setOpponentFound] = useState(false)
  const [opponent, setOpponent] = useState<Player | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [instructionsConfirmed, setInstructionsConfirmed] = useState(false)
  const [roomCode] = useState(() => generateRoomCode())

  const mode = useGameStore((state) => state.mode)
  const setPlayers = useGameStore((state) => state.setPlayers)
  const reset = useGameStore((state) => state.reset)

  const userId = useUserStore((state) => state.id)
  const username = useUserStore((state) => state.username)
  const avatar = useUserStore((state) => state.avatar)
  const mmr = useUserStore((state) => state.mmr)

  const modeConfig = BRAIN_RING_SUB_MODES.find((m) => m.id === mode)

  const currentPlayer: Player = {
    id: userId || 'user',
    username,
    avatar,
    mmr,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    isReady: true,
    score: 0,
    connected: true,
  }

  const handleCancel = useCallback(() => {
    reset()
    router.push('/lobby')
  }, [reset, router])

  useEffect(() => {
    showBack(handleCancel)
    return () => hideBack()
  }, [showBack, hideBack, handleCancel])

  const handleInstructionConfirm = useCallback(() => {
    setShowInstructions(false)
    setInstructionsConfirmed(true)
    haptic('medium')
  }, [haptic])

  useEffect(() => {
    if (!mode) {
      router.push('/lobby')
      return
    }

    if (!instructionsConfirmed) return

    if (mode === 'group') return

    const matchDelay = mode === 'solo' ? 1000 : 2000 + Math.random() * 2000

    const findOpponentTimer = setTimeout(() => {
      const randomOpponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)]
      setOpponent(randomOpponent)
      setOpponentFound(true)
      haptic('success')

      setPlayers([currentPlayer, randomOpponent])
    }, matchDelay)

    return () => clearTimeout(findOpponentTimer)
  }, [mode, router, haptic, setPlayers, instructionsConfirmed])

  useEffect(() => {
    if (opponentFound && opponent) {
      const navigateTimer = setTimeout(() => {
        router.push(ARENA_PATH)
      }, 2500)

      return () => clearTimeout(navigateTimer)
    }
  }, [opponentFound, opponent, router])

  const deepLink = `https://t.me/AqliyOyinlarBot/app?startapp=${roomCode}`

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/30 p-4">
            <div>
              <h1 className="font-semibold text-foreground">
                {modeConfig?.nameUz || 'Loading...'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatBrainRingSessionLabel(mode)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {!instructionsConfirmed ? (
                <motion.div
                  key="waiting-instructions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.p
                    className="text-center text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Qoidalarni o&apos;qing...
                  </motion.p>
                </motion.div>
              ) : mode === 'group' && !opponentFound ? (
                <motion.div
                  key="room-invite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md"
                >
                  <RoomInvite
                    roomCode={roomCode}
                    deepLink={deepLink}
                    players={[
                      { id: userId || 'user', name: username, isReady: true },
                    ]}
                  />
                </motion.div>
              ) : !opponentFound ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-8"
                >
                  <PulseLoader className="h-48 w-48" />
                  <div className="text-center">
                    <motion.p
                      className="text-lg font-medium text-foreground"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Raqib qidirilmoqda...
                    </motion.p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bu biroz vaqt olishi mumkin
                    </p>
                  </div>
                </motion.div>
              ) : opponent ? (
                <motion.div
                  key="found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <OpponentFound
                    currentPlayer={currentPlayer}
                    opponent={opponent}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <InstructionModal
          open={showInstructions && !!mode}
          mode={mode}
          onConfirm={handleInstructionConfirm}
        />
      </TgSafeArea>
    </AppShell>
  )
}
