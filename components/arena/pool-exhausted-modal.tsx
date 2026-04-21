'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/game-store'
import { useGameSocket } from '@/hooks/use-game-socket'

export const PoolExhaustedModal = () => {
  const router = useRouter()
  const { isPoolExhausted, setPoolExhausted } = useGameStore()
  const { resetPlayedQuestions } = useGameSocket()
  const [isResetting, setIsResetting] = React.useState(false)

  if (!isPoolExhausted) return null

  const handleWait = () => {
    setPoolExhausted(false)
    router.push('/lobby')
  }

  const handleReplay = () => {
    setIsResetting(true)
    resetPlayedQuestions()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          {/* Content */}
          <div className="relative flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
              <RotateCcw className="h-8 w-8 text-primary animate-pulse" />
            </div>

            <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
              Sessiya yakunlandi
            </h2>
            
            <p className="mb-8 text-neutral-400 text-lg leading-relaxed">
              Siz barcha mavjud savollarni yakunladingiz. 
              Savollarni qaytadan o'ynashni xohlaysizmi yoki yangi savollar qo'shilishini kutasizmi?
            </p>

            {/* Actions */}
            <div className="flex w-full gap-4">
              {/* Wait / Exit Button */}
              <button
                onClick={handleWait}
                className="group relative flex h-16 flex-1 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 transition-all hover:bg-white/[0.08] active:scale-95"
              >
                <LogOut className="h-7 w-7 text-neutral-400 transition-colors group-hover:text-white" />
              </button>

              {/* Replay / Reset Button */}
              <button
                onClick={handleReplay}
                disabled={isResetting}
                className="group relative flex h-16 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                {isResetting ? (
                   <div className="flex items-center gap-2">
                     <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                   </div>
                ) : (
                  <RotateCcw className="relative h-7 w-7 text-black transition-transform group-hover:rotate-180 duration-500" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
