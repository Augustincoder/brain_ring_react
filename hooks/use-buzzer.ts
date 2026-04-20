'use client'

import { useCallback } from 'react'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { triggerHaptic } from '@/lib/telegram'
import { getGameSocket } from '@/services/game-socket'

interface UseBuzzerReturn {
  canPress: boolean
  isWinner: boolean
  isLocked: boolean
  pressBuzzer: () => void
  buzzerWinner: string | null
}

export function useBuzzer(): UseBuzzerReturn {
  const userId = useUserStore((state) => state._id)
  const activeUserId = userId || 'user'
  const phase = useGameStore((state) => state.phase)
  const buzzerWinner = useGameStore((state) => state.buzzerWinner)
  const answeredPlayers = useGameStore((state) => state.answeredPlayers)

  // A player can only press the buzzer if the server is accepting buzzers (buzzing phase)
  // The server natively guards against players who already answered incorrectly.
  const canPress = phase === 'buzzing' && !buzzerWinner && !answeredPlayers.includes(activeUserId)
  const isWinner = buzzerWinner === activeUserId
  const isLocked = !!buzzerWinner

  const pressBuzzer = useCallback(() => {
    if (!canPress) return
    
    // Emit buzz_in to server natively
    getGameSocket().buzzIn()
    
    triggerHaptic('heavy')
  }, [canPress])

  return {
    canPress,
    isWinner,
    isLocked,
    pressBuzzer,
    buzzerWinner,
  }
}
