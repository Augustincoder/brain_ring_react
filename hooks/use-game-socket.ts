'use client'

import { useEffect, useCallback, useRef } from 'react'
import { getGameSocket, resetGameSocket, GameSocket } from '@/services/game-socket'
import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import type {
  RoomCreatedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  GameStartingPayload,
  QuestionReadyPayload,
  PlayerAnsweringPayload,
  AnswerResultPayload,
  QuestionTimeoutPayload,
  QuestionRevealPayload,
  BuzzerOpenPayload,
  MatchResultsPayload,
  HostChangedPayload,
  ErrorPayload
} from '@/types/socket'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function useGameSocket() {
  const socketRef = useRef<GameSocket | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const hasAttemptedRejoin = useRef(false)

  const {
    setRoom, setPlayers, setPhase, setQuestion,
    pressBuzzer, setAnswerResult, setQuestionReveal,
    openBuzzer, setGameEnd, setHostId, setSyncing
  } = useGameStore()

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT 1: Attach all persistent socket event listeners.
  // This runs once on mount and survives re-renders.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getGameSocket()
    socketRef.current = socket

    const handleRoomCreated = (payload: any) => {
      const hostId = payload.hostId || (payload.players?.[0]?.userId ?? 'unknown')
      setRoom(payload.roomCode, payload.gameType, hostId as string)
      setPlayers(payload.players)
    }

    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      setPlayers(payload.players)
    }

    const handlePlayerLeft = (payload: PlayerLeftPayload) => {
      setPlayers(payload.players)
    }

    const handleHostChanged = (payload: HostChangedPayload) => {
      setHostId(payload.newHostId)
    }

    const handleGameStarting = (payload: GameStartingPayload) => {
      setPhase('waiting')
      if (typeof window !== 'undefined' && window.location.pathname !== '/arena/brain-ring') {
        router.push('/arena/brain-ring')
      }
    }

    // ── PILLAR 1: question_ready now carries endTime ──────────────────────────
    // setQuestion() clears isSyncing — this is the "sync complete" signal.
    const handleQuestionReady = (payload: QuestionReadyPayload) => {
      setQuestion(
        { text: payload.questionText },
        payload.questionIndex,
        payload.totalQuestions,
        payload.endTime,          // absolute epoch ms — replaces readingTimeMs duration
        payload.chancesLeft || 3
      )
      if (payload.players) setPlayers(payload.players)
    }

    const handlePlayerAnswering = (payload: PlayerAnsweringPayload) => {
      pressBuzzer(payload.buzzerId, payload.buzzerUsername, payload.endTime)
    }

    const handleAnswerResult = (payload: AnswerResultPayload) => {
      setAnswerResult(payload.userId, payload.isCorrect, payload.correctAnswer, payload.chancesLeft, payload.givenAnswer)
      if (payload.players) setPlayers(payload.players)
    }

    const handleQuestionTimeout = (payload: QuestionTimeoutPayload) => {
      setQuestionReveal(payload.correctAnswer, payload.explanation)
    }

    const handleQuestionReveal = (payload: QuestionRevealPayload) => {
      setQuestionReveal(payload.correctAnswer, payload.explanation)
    }

    const handleBuzzerOpen = (payload: BuzzerOpenPayload) => {
      openBuzzer(payload.chancesLeft, payload.endTime)
    }

    const handleMatchResults = (payload: MatchResultsPayload) => {
      setGameEnd(payload)
      router.push('/results')
    }

    const handleError = (payload: ErrorPayload) => {
      console.error('[Socket Error]', payload.message)
      
      // If room is missing or game started, send them back to safety
      if (payload.message.includes('Room not found') || payload.message.includes('already started')) {
        router.push('/lobby')
      }

      // If syncing and we get an error, clear the syncing state so the UI unblocks
      if (useGameStore.getState().isSyncing) {
        setSyncing(false)
      }
      toast({
        title: 'Xatolik',
        description: payload.message,
        variant: 'destructive',
      })
    }

    socket.on('room_created', handleRoomCreated)
    socket.on('player_joined', handlePlayerJoined)
    socket.on('player_left', handlePlayerLeft)
    socket.on('host_changed', handleHostChanged)
    socket.on('game_starting', handleGameStarting)
    socket.on('question_ready', handleQuestionReady)
    socket.on('player_answering', handlePlayerAnswering)
    socket.on('answer_result', handleAnswerResult)
    socket.on('question_timeout', handleQuestionTimeout)
    socket.on('question_reveal', handleQuestionReveal)
    socket.on('buzzer_open', handleBuzzerOpen)
    socket.on('match_results', handleMatchResults)
    socket.on('error', handleError)

    return () => {
      socket.off('room_created', handleRoomCreated)
      socket.off('player_joined', handlePlayerJoined)
      socket.off('player_left', handlePlayerLeft)
      socket.off('host_changed', handleHostChanged)
      socket.off('game_starting', handleGameStarting)
      socket.off('question_ready', handleQuestionReady)
      socket.off('player_answering', handlePlayerAnswering)
      socket.off('answer_result', handleAnswerResult)
      socket.off('question_timeout', handleQuestionTimeout)
      socket.off('question_reveal', handleQuestionReveal)
      socket.off('buzzer_open', handleBuzzerOpen)
      socket.off('match_results', handleMatchResults)
      socket.off('error', handleError)
    }
  }, [
    setRoom, setPlayers, setPhase, setQuestion, pressBuzzer,
    setAnswerResult, setQuestionReveal, openBuzzer, setGameEnd,
    setHostId, setSyncing, router, toast,
  ])

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT 2: PILLAR 1 — Reconnection Rehydration on Mount.
  //
  // Reads the persisted 'game-session' from localStorage (written by Zustand
  // persist middleware on game-store). If a roomCode exists AND the socket is
  // not already connected, we connect and emit rejoin_room.
  //
  // setSyncing(true) shows the loading guard immediately. The guard clears
  // itself inside setQuestion() when the server delivers question_ready.
  //
  // Guard: hasAttemptedRejoin prevents firing twice in React StrictMode.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasAttemptedRejoin.current) return
    hasAttemptedRejoin.current = true

    const token = useUserStore.getState().token
    if (!token) return // not authenticated — nothing to rejoin

    const socket = getGameSocket()

    // The socket is already connected (e.g. normal navigation) — nothing to do.
    if (socket.isConnected()) return

    // Read persisted session from localStorage via Zustand persist storage key.
    let persisted: { roomCode?: string; phase?: string } | null = null
    try {
      const raw = localStorage.getItem('game-session')
      if (raw) persisted = JSON.parse(raw)?.state ?? null
    } catch {
      // localStorage unavailable (SSR guard) — no-op
    }

    // Guard: Do NOT attempt rehydration if we are already in matchmaking or lobby flow.
    // Rehydration is only for active arena sessions that were interrupted by a refresh.
    if (typeof window !== 'undefined' && (
      window.location.pathname === '/matchmaking' || 
      window.location.pathname === '/lobby'
    )) return

    const roomCode = persisted?.roomCode
    const phase = persisted?.phase

    // Only attempt rejoin for active game phases — not matchmaking/waiting/finished.
    const activePhases = ['reading', 'buzzing', 'answering', 'results', 'reveal']
    if (!roomCode || !phase || !activePhases.includes(phase)) return

    // ── Fire the reconnect sequence ───────────────────────────────────────
    console.log(`[Rejoin] Attempting to resume session for room ${roomCode} (Phase: ${phase})`)
    setSyncing(true)

    socket.connect()
      .then(() => {
        socket.rejoinRoom(roomCode)
        // Safety timeout: if the server doesn't respond within 6 seconds
        // (e.g. room expired), clear the syncing guard so the UI unblocks.
        setTimeout(() => {
          if (useGameStore.getState().isSyncing) {
            setSyncing(false)
            toast({
              title: 'Xona topilmadi',
              description: 'O\'yin sessiyasi tugagan yoki muddati o\'tgan.',
              variant: 'destructive',
            })
          }
        }, 6_000)
      })
      .catch((err) => {
        console.error('[Rejoin] Socket connect failed:', err)
        setSyncing(false)
        toast({
          title: 'Ulanib bo\'lmadi',
          description: 'Server bilan aloqa o\'rnatilmadi. Qayta urinib ko\'ring.',
          variant: 'destructive',
        })
      })
  }, [setSyncing, toast])

  // ─────────────────────────────────────────────────────────────────────────
  // Outbound action API
  // ─────────────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    const socket = getGameSocket()
    await socket.connect()
  }, [])

  const disconnect = useCallback(() => {
    resetGameSocket()
  }, [])

  const createRoom = useCallback((gameType: 'solo' | '1v1' | 'group') => {
    getGameSocket().createRoom(gameType)
  }, [])

  const joinRoom = useCallback((roomCode: string) => {
    getGameSocket().joinRoom(roomCode)
  }, [])

  const startGame = useCallback(() => {
    getGameSocket().startGame()
  }, [])

  const buzzIn = useCallback(() => {
    getGameSocket().buzzIn()
  }, [])

  const submitAnswer = useCallback((answer: string) => {
    getGameSocket().submitAnswer(answer)
  }, [])

  const forceQuitGame = useCallback(() => {
    getGameSocket().forceQuitGame()
  }, [])

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    buzzIn,
    submitAnswer,
    forceQuitGame,
  }
}
