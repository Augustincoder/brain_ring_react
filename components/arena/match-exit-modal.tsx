'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, LogOut, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MatchExitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function MatchExitModal({ isOpen, onClose, onConfirm }: MatchExitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]",
              "w-[90%] max-w-sm bg-card border border-border/50 rounded-3xl p-6 shadow-2xl"
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 ring-4 ring-rose-500/5">
                <AlertCircle className="h-8 w-8 text-rose-500" />
              </div>
              
              <h2 className="text-xl font-black text-foreground mb-2">
                O&apos;yinni to&apos;xtatish
              </h2>
              <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                O&apos;yinni saqlab chiqib ketishni xohlaysizmi? <br /> 
                Hozirgi natijalaringiz saqlanadi.
              </p>

              <div className="flex flex-col w-full gap-3">
                <Button
                  onClick={onConfirm}
                  variant="destructive"
                  size="lg"
                  className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-rose-500/20"
                >
                  <LogOut className="h-5 w-5" />
                  Ha, saqlash va chiqish
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="w-full h-14 rounded-2xl font-bold gap-2 border-border/50 hover:bg-muted"
                >
                  <Play className="h-5 w-5" />
                  Yo&apos;q, davom etish
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
