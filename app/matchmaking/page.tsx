'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { PulseLoader } from '@/components/matchmaking/pulse-loader'
import { RoomInvite } from '@/components/lobby/room-invite'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { useGameSocket } from '@/hooks/use-game-socket'
import { BRAIN_RING_SUB_MODES, formatBrainRingSessionLabel } from '@/types/game'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function MatchmakingContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const router = useRouter()
  const { connect, disconnect, createRoom, startGame, joinRoom } = useGameSocket()

  const mode = useGameStore((state) => state.mode)
  const roomCode = useGameStore((state) => state.roomCode)
  const players = useGameStore((state) => state.players)
  const isHost = useGameStore((state) => state.isHost)
  const userId = useUserStore((state) => state._id)

  const setMode = useGameStore((state) => state.setMode)
  const modeConfig = BRAIN_RING_SUB_MODES.find((m) => m.id === mode)

  const handleCancel = useCallback(() => {
    disconnect()
    useGameStore.getState().reset()
    router.push('/lobby')
  }, [disconnect, router])

  const handleJoinByCode = useCallback((code: string) => {
    // Optimistic UI state
    useGameStore.getState().setRoom(code, useGameStore.getState().mode || 'group', '')
    // Leave previous room implicitly by standard socket logic
    joinRoom(code)
  }, [joinRoom])

  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const queryRoomCode = searchParams.get('roomCode')

    if (queryRoomCode) {
      const code = queryRoomCode.toUpperCase()
      if (!mode) setMode('group')
      
      // Optimistically set room to bypass 'Tarmoqqa ulanmoqda' screen immediately
      useGameStore.getState().setRoom(code, mode || 'group', '')
      
      connect().then(() => {
        joinRoom(code)
      }).catch((err) => {
        toast({ title: 'Xatolik', description: 'Ulanishda xatolik yuz berdi.', variant: 'destructive' })
        handleCancel()
      })
      return
    }

    if (!mode) {
      router.push('/lobby')
      return
    }

    connect().then(() => {
      createRoom(mode)
    }).catch((err) => {
      toast({ title: 'Xatolik', description: 'Ulanishda xatolik yuz berdi.', variant: 'destructive' })
      handleCancel()
    })
  }, [mode, router, connect, createRoom, joinRoom, handleCancel, searchParams, setMode, toast])

  useEffect(() => {
    if (mode === 'solo' && roomCode && Object.keys(players).length > 0 && isHost(userId)) {
      setTimeout(() => startGame(), 1000)
    }
  }, [mode, roomCode, players, startGame, isHost, userId])

  const handleStartGame = () => {
    if (players.length < 2) {
      toast({ title: 'Ogohlantirish', description: "Kamida 2 ta o'yinchi kerak!", variant: 'destructive' })
      return
    }
    startGame()
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')
  const deepLink = `${siteUrl}/matchmaking?roomCode=${roomCode}`

  return (
    <AppShell>
      <TgSafeArea>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/30 p-4">
            <div>
              <h1 className="font-semibold text-foreground">
                {modeConfig?.nameUz || 'Yuklanmoqda...'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatBrainRingSessionLabel(mode)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {mode === 'group' && roomCode ? (
                <motion.div key="room-invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-black tracking-widest text-primary mb-2 select-all">{roomCode}</h2>
                    <p className="text-sm text-muted-foreground">Xos Xona Kodi</p>
                  </div>
                  <RoomInvite roomCode={roomCode} deepLink={deepLink} players={players.map((p: any) => ({ ...p, name: p.username, id: p.userId, isReady: true }))} onJoinByCode={handleJoinByCode} />
                  {isHost(userId) ? (
                    <Button onClick={handleStartGame} className="w-full mt-6 h-14 text-lg font-bold shadow-lg" size="lg">O'yinni boshlash</Button>
                  ) : (
                    <p className="text-muted-foreground text-center mt-6">Xost o'yinni boshlashini kuting...</p>
                  )}
                </motion.div>
              ) : (mode === '1v1' && roomCode && players.length < 2) ? (
                <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8">
                  <PulseLoader className="h-48 w-48" />
                  <div className="text-center">
                    <motion.p className="text-lg font-medium text-foreground" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      Raqib kutilmoqda...
                    </motion.p>
                    <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all">Xona: <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">{roomCode}</span></p>
                  </div>
                </motion.div>
              ) : (mode === '1v1' && roomCode && players.length >= 2) ? (
                <motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-card p-10 rounded-3xl shadow-xl border border-primary/20">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20">
                    <span className="text-4xl">⚔️</span>
                  </div>
                  <h2 className="text-3xl font-black text-emerald-500 mb-6 drop-shadow-sm">Raqib topildi!</h2>
                  {isHost(userId) ? (
                    <Button onClick={handleStartGame} size="lg" className="h-14 px-10 text-lg font-bold shadow-lg shadow-emerald-500/25">O'yinni boshlash</Button>
                  ) : (
                    <p className="text-muted-foreground font-medium animate-pulse">Tarmoq sinxronlanmoqda...</p>
                  )}
                </motion.div>
              ) : (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <PulseLoader className="h-24 w-24 opacity-50" />
                  <p className="text-muted-foreground font-medium animate-pulse">Tarmoqqa ulanmoqda...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </TgSafeArea>
    </AppShell>
  )
}

export default function MatchmakingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><PulseLoader className="h-16 w-16 opacity-50" /></div>}>
      <MatchmakingContent />
    </Suspense>
  )
}
