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
        "bg-card/40 backdrop-blur-xl rounded-2xl p-4 md:p-6",
        "border border-border/30 shadow-xl",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Hash className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">Xonaga qo&apos;shilish</h3>
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
                "w-full h-12 text-2xl text-center font-mono font-bold tracking-[0.2em]",
                "bg-background/40 border-border/20 rounded-xl",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground/20 shadow-inner px-2"
              )}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            disabled={manualCode.length !== 4 || isLoading}
            className={cn(
              "h-12 px-6 rounded-xl font-bold text-sm",
              "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md",
              "transition-all active:scale-95 shrink-0"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5 mr-1.5" />
            )}
            Kirish
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
