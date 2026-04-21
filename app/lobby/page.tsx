'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { UserProfileCard } from '@/components/lobby/user-profile-card'
import { ModeGrid } from '@/components/lobby/mode-grid'
import { JoinRoomInput } from '@/components/lobby/join-room-input'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { GameMode } from '@/types/game'

export default function LobbyPage() {
  const router = useRouter()
  const [isCheckingRoom, setIsCheckingRoom] = React.useState(false)
  const setMode = useGameStore((state) => state.setMode)
  const reset = useGameStore((state) => state.reset)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    reset()
  }, [reset, isAuthenticated, router])

  const handleSelectMode = (mode: GameMode) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setMode(mode)
    router.push('/matchmaking')
  }

  const handleJoinByCode = async (code: string) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (isCheckingRoom) return
    
    try {
      setIsCheckingRoom(true)
      // ── Pre-check room existence on backend ───────────────────────────────
      const res = await api.get(`/api/game/room/check/${code}`)
      
      if (res.data.exists) {
        setMode(res.data.gameType) // Sync the mode from the room
        router.push(`/matchmaking?roomCode=${code}`)
      } else {
        setIsCheckingRoom(false)
        toast.error(res.data.message || 'Xona topilmadi.')
      }
    } catch (err: any) {
      setIsCheckingRoom(false)
      const message = err?.response?.data?.message || 'Server bilan bog\'lanishda xatolik yuz berdi.'
      toast.error(message)
      console.error('[Lobby] Room check failed:', message)
    }
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

          <div className="flex-1 relative z-10 w-full max-w-2xl mx-auto flex flex-col justify-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="px-4 py-2"
            >
              <ModeGrid onSelectMode={handleSelectMode} />
              
              <div className="mt-4 px-4">
                <JoinRoomInput 
                  onJoin={handleJoinByCode} 
                  isLoading={isCheckingRoom}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}
