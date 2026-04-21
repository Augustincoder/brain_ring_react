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
import { useHydrated } from '@/hooks/use-hydrated'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { GameMode } from '@/types/game'

export default function LobbyPage() {
  const router = useRouter()
  const [isCheckingRoom, setIsCheckingRoom] = React.useState(false)
  const setMode = useGameStore((state) => state.setMode)
  const reset = useGameStore((state) => state.reset)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const username = useUserStore((state) => state.username)
  const hydrated = useHydrated()

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
        <div className="flex h-full flex-col bg-[#050505] relative overflow-hidden">
          {/* Immersive Background Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-20%] w-[100%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Minimalist Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-20 border-b border-white/5 bg-neutral-950/40 backdrop-blur-xl"
          >
            <UserProfileCard />
          </motion.div>

          <div className="flex-1 relative z-10 w-full max-w-2xl mx-auto flex flex-col pt-8 space-y-4 custom-scrollbar">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="px-8 flex flex-col gap-1"
            >
              <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] font-sans">
                Welcome back
              </h2>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter mix-blend-difference">
                {hydrated ? username : 'Guest'}
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex-1"
            >
              {/* High-Impact Mode Hub */}
              <ModeGrid onSelectMode={handleSelectMode} />
              
              {/* Minimalist Room Join */}
              <div className="px-6 pt-2 pb-10">
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
