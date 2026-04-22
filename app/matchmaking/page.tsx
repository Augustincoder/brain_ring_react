'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation' 
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { TgSafeArea } from '@/components/layout/tg-safe-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Swords, Share2, Play, Copy, Check } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useGameStore } from '@/store/game-store'
import { useGameSocket } from '@/hooks/use-game-socket'
import { PulseLoader } from '@/components/matchmaking/pulse-loader'
import { cn } from '@/lib/utils'

export default function MatchmakingPage() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const user = useUserStore()
  
  const { roomCode: storeRoomCode, players } = useGameStore() 
  const { connect, createRoom, joinRoom, startGame, disconnect } = useGameSocket()

  const [copied, setCopied] = useState(false)
  // O'ZGARISH: Ulashish nusxalanganini bildirish uchun state
  const [shareCopied, setShareCopied] = useState(false) 
  const isInitializing = useRef(false)

  useEffect(() => {
    const initGame = async () => {
      if (typeof window === 'undefined') return; 

      if (storeRoomCode || isInitializing.current) return

      isInitializing.current = true
      
      await connect()
      
      const urlRoomCode = searchParams.get('roomCode')

      if (urlRoomCode) {
        joinRoom(urlRoomCode)
      } else {
        createRoom('1v1')
      }
    }
    
    initGame()
  }, [storeRoomCode, searchParams, connect, createRoom, joinRoom])

  const currentUserId = user?._id || 'unknown'
  const opponent = players.find(p => p.userId !== currentUserId)
  const opponentFound = !!opponent

  const copyToClipboard = () => {
    if (!storeRoomCode) return
    navigator.clipboard.writeText(storeRoomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // O'ZGARISH: Ulashish mantig'i
  const handleShare = async () => {
    if (!storeRoomCode) return
    
    const shareUrl = `${window.location.origin}/matchmaking?roomCode=${storeRoomCode}`
    const shareData = {
      title: "Brain Ring 1v1",
      text: `Men bilan Brain Ring o'ynang! Xona kodi: ${storeRoomCode}`,
      url: shareUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Ulashish bekor qilindi yoki xatolik:", err)
      }
    } else {
      // Fallback: Agar qurilma Share API'ni qo'llab-quvvatlamasa, linkni nusxalaymiz
      navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const handleBack = () => {
    disconnect() 
    useGameStore.getState().reset() 
    router.back()
  }

  const handleStartGame = () => {
    startGame() 
  }

  return (
    <AppShell>
      <TgSafeArea>
        <div className="relative flex flex-col h-full bg-black overflow-hidden">
          {/* Header */}
          <div className="z-20 flex items-center p-6 bg-transparent">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10" onClick={handleBack}>
              <ChevronLeft className="h-6 w-6 text-neutral-400" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-around px-6 pb-12">
            
            {/* 1-O'YINCHI (Siz) */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Avatar className="w-28 h-28 border-2 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'player1'}`} />
                  <AvatarFallback className="bg-neutral-900 text-2xl font-black">{user?.username?.[0] || '1'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Siz</span>
                </div>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{user?.username || "Player 1"}</h2>
            </motion.div>

            {/* VS Ikonkasi */}
            <div className="relative flex items-center justify-center w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <motion.div 
                animate={{ scale: opponentFound ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-black px-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center rotate-45">
                  <Swords className="w-6 h-6 text-neutral-500 -rotate-45" />
                </div>
              </motion.div>
            </div>

            {/* 2-O'YINCHI SLOTI (Kutish yoki Topilgan holat) */}
            <div className="flex flex-col items-center gap-4 min-h-[160px] justify-center">
              <AnimatePresence mode="wait">
                {!opponentFound ? (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <PulseLoader />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="found"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Avatar className="w-28 h-28 border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.username || 'opponent'}`} />
                      <AvatarFallback className="bg-neutral-900 text-2xl font-black text-red-500">{opponent?.username?.[0] || '2'}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">{opponent?.username || "Raqib"}</h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* PASTKI BOSHQARUV PANEL */}
          <div className="p-6 pb-8 bg-[#050505] border-t border-white/5 rounded-t-[2.5rem]">
            <AnimatePresence mode="wait">
              {!opponentFound ? (
                <motion.div 
                  key="invite-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Xona Kodi</span>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-4 hover:bg-white/5 px-4 py-2 rounded-2xl transition-all"
                    >
                      <div className="flex h-14 items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                          {!storeRoomCode ? (
                            <motion.span
                              key="loading"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 0.5, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="text-5xl font-black text-white tracking-widest"
                            >
                              ....
                            </motion.span>
                          ) : (
                            <motion.div
                              key="code"
                              className="flex gap-1.5"
                            >
                              {storeRoomCode.split('').map((char, index) => (
                                <motion.span
                                  key={index}
                                  initial={{ opacity: 0, y: 30, scale: 0.5 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: index * 0.1
                                  }}
                                  className="text-5xl font-black text-white"
                                >
                                  {char}
                                </motion.span>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {copied ? <Check className="w-6 h-6 text-green-500 ml-2" /> : <Copy className="w-6 h-6 text-neutral-600 ml-2" />}
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    {/* O'ZGARISH: onClick={handleShare} biriktirildi */}
                    <Button 
                      onClick={handleShare}
                      className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      {shareCopied ? (
                        <>
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          Nusxalandi
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5 mr-2" />
                          Ulashish
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="start-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <Button 
                    onClick={handleStartGame}
                    className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-3"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    O'yinni Boshlash
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </TgSafeArea>
    </AppShell>
  )
}