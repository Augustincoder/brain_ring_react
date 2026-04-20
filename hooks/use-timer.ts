'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/game-store'

interface UseTimerOptions {
  onTimeUp?: () => void
  onTick?: (remaining: number) => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onTimeUp, onTick } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const dynamicTimerMs = useGameStore((state) => state.dynamicTimerMs)
  const timeRemaining = useGameStore((state) => state.timeRemaining)
  const timerActive = useGameStore((state) => state.timerActive)
  const setTimeRemaining = useGameStore((state) => state.setTimeRemaining)
  const setTimerActive = useGameStore((state) => state.setTimerActive)
  const currentPhase = useGameStore((state) => state.currentPhase)
  const timeRemainingRef = useRef<number>(timeRemaining)

  const startTimer = useCallback((duration: number) => {
    setTimeRemaining(duration)
    setTimerActive(true)
  }, [setTimeRemaining, setTimerActive])

  const stopTimer = useCallback(() => {
    setTimerActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [setTimerActive])

  const resetTimer = useCallback((duration: number) => {
    stopTimer()
    setTimeRemaining(duration)
  }, [stopTimer, setTimeRemaining])

  // Automatically start mirror timer when dynamicTimerMs changes and phase is reading
  useEffect(() => {
     if (currentPhase === 'reading' && dynamicTimerMs > 0) {
        startTimer(Math.floor(dynamicTimerMs / 1000))
     } else if (currentPhase !== 'reading' && currentPhase !== 'action') {
        stopTimer()
     }
  }, [currentPhase, dynamicTimerMs, startTimer, stopTimer])

  // ✅ FIX: Use ref for callbacks to avoid dependency changes
  const onTimeUpRef = useRef(onTimeUp)
  const onTickRef = useRef(onTick)
  
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
    onTickRef.current = onTick
  }, [onTimeUp, onTick])

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  // ✅ FIX: Minimal dependencies - only timerActive triggers setup/cleanup
  useEffect(() => {
    if (!timerActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // ✅ FIX: Clear any existing interval before creating new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const next = Math.max(0, timeRemainingRef.current - 1)

      setTimeRemaining(next)

      // Call tick callback
      onTickRef.current?.(next)
      
      // Check if time is up
      if (next <= 0) {
        setTimerActive(false)
        onTimeUpRef.current?.()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerActive, setTimeRemaining, setTimerActive]) // ✅ Minimal deps

  const progress = timeRemaining > 0 
      ? (timeRemaining / Math.max(1, Math.floor(dynamicTimerMs / 1000) || 15)) * 100 
      : 0;

  return {
    timeRemaining,
    timerActive,
    startTimer,
    stopTimer,
    resetTimer,
    progress,
  }
}