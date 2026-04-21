'use client'

import React, { useState } from 'react'
import { Hash, UserPlus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface JoinRoomInputProps {
  onJoin: (code: string) => void
  isLoading?: boolean
  className?: string
}

export function JoinRoomInput({ onJoin, isLoading, className }: JoinRoomInputProps) {
  const [manualCode, setManualCode] = React.useState('')

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.length !== 4) return
    onJoin(manualCode)
    setManualCode('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    if (val.length <= 4) {
      setManualCode(val)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className={cn(
        "relative overflow-hidden",
        "bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-4 md:p-5",
        "border border-white/5 shadow-2xl",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] font-sans">
              Enter Room Code
            </h3>
          </div>
        </div>
        
        <form onSubmit={handleJoinByCode} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={manualCode}
              onChange={handleChange}
              placeholder="0000"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              className={cn(
                "w-full h-14 text-3xl text-center font-black tracking-[0.4em] font-sans text-white",
                "bg-black/20 border-white/5 rounded-2xl",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                "placeholder:text-white/5 shadow-inner px-2 transition-all"
              )}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            disabled={manualCode.length !== 4 || isLoading}
            className={cn(
              "h-14 w-14 rounded-2xl p-0",
              "bg-primary hover:bg-primary/90 text-neutral-950 shadow-lg",
              "transition-all active:scale-90 shrink-0"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UserPlus className="h-6 w-6" />
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
