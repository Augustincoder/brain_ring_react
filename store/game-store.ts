import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameMode, GamePhase, Question, MatchResult } from '@/types/game'
import { normalizeQuestion } from '@/lib/normalize-question'

export interface GamePlayer {
  userId?: string
  socketId?: string
  username: string
  score: number
  correctAnswers: number
  wrongAnswers: number
}

interface GameState {
  roomId: string | null
  roomCode: string | null
  mode: GameMode | null
  hostId: string | null
  
  players: GamePlayer[]
  
  phase: GamePhase
  currentQuestion: Question | null
  questionNumber: number
  totalQuestions: number
  
  // Timers — stored as absolute epoch timestamps (ms), not durations
  // This enables server-authoritative time calculation after reconnect.
  readingEndTime: number | null
  answerEndTime: number | null
  // Legacy duration fields kept for ProgressTimer compatibility (will be derived)
  readingTimeMs: number
  answerTimeMs: number
  
  // Buzzer State
  buzzerWinner: string | null
  buzzerUsername: string | null
  chancesLeft: number
  
  // Results
  lastAnswerResult: {
    userId: string
    isCorrect: boolean
    correctAnswer: string | null
    givenAnswer?: string | null
  } | null
  questionExplanation: string | null
  
  matchResult: MatchResult | null
  
  // Track players who answered wrong for current question
  answeredPlayers: string[]

  // Reconnect sync guard — true while waiting for server to re-deliver state after refresh
  isSyncing: boolean

  // Computed
  isHost: (userId: string | null) => boolean

  // Actions
  setMode: (mode: GameMode) => void
  setRoom: (roomCode: string, mode: GameMode, hostId: string) => void
  setPlayers: (players: GamePlayer[]) => void
  setHostId: (hostId: string) => void
  setPhase: (phase: GamePhase) => void
  setQuestion: (question: Partial<Question>, index: number, total: number, readingEndTime: number, chancesLeft: number) => void
  pressBuzzer: (buzzerId: string, buzzerUsername: string, answerEndTime: number) => void
  setAnswerResult: (userId: string, isCorrect: boolean, correctAnswer: string | null, chancesLeft: number, givenAnswer?: string) => void
  setQuestionReveal: (correctAnswer: string, explanation: string) => void
  openBuzzer: (chancesLeft: number, answerEndTime: number) => void
  setGameEnd: (result: MatchResult) => void
  setSyncing: (val: boolean) => void
  reset: () => void
}

const initialState = {
  roomId: null,
  roomCode: null,
  mode: null,
  hostId: null,
  players: [],
  phase: 'matchmaking' as GamePhase,
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 0,
  readingEndTime: null,
  answerEndTime: null,
  readingTimeMs: 0,
  answerTimeMs: 0,
  buzzerWinner: null,
  buzzerUsername: null,
  chancesLeft: 3,
  lastAnswerResult: null,
  questionExplanation: null,
  matchResult: null,
  answeredPlayers: [],
  isSyncing: false,
}

export const useGameStore = create<GameState>()(persist(
  (set, get) => ({
    ...initialState,

    isHost: (userId) => {
      const s = get()
      return !!userId && !!s.hostId && s.hostId === userId
    },

    setMode: (mode) => set({ mode }),

    setRoom: (roomCode, mode, hostId) => set({
      roomCode,
      mode,
      hostId,
      phase: 'waiting',
    }),

    setPlayers: (players) => set({ players }),

    setHostId: (hostId) => set({ hostId }),

    setPhase: (phase) => set({ phase }),

    setQuestion: (questionObj, questionIndex, totalQuestions, readingEndTime, chancesLeft = 3) => set({
      currentQuestion: normalizeQuestion({ ...questionObj, id: `q_${questionIndex}` }),
      questionNumber: questionIndex,
      totalQuestions,
      readingEndTime,
      readingTimeMs: Math.max(0, readingEndTime - Date.now()),
      chancesLeft,
      phase: 'reading',
      buzzerWinner: null,
      buzzerUsername: null,
      lastAnswerResult: null,
      questionExplanation: null,
      answeredPlayers: [],
      isSyncing: false, // sync complete — server delivered question
    }),

    pressBuzzer: (buzzerId, buzzerUsername, answerEndTime) => set({
      buzzerWinner: buzzerId,
      buzzerUsername,
      answerEndTime,
      answerTimeMs: Math.max(0, answerEndTime - Date.now()),
      phase: 'answering',
    }),

    setAnswerResult: (userId, isCorrect, correctAnswer, chancesLeft, givenAnswer) => set((state) => ({
      lastAnswerResult: { userId, isCorrect, correctAnswer, givenAnswer },
      chancesLeft,
      phase: 'results',
      buzzerWinner: null,
      buzzerUsername: null,
      answeredPlayers: [...state.answeredPlayers, userId],
    })),

    setQuestionReveal: (correctAnswer, explanation) => set({
      lastAnswerResult: { userId: '', isCorrect: false, correctAnswer },
      questionExplanation: explanation,
      phase: 'reveal',
    }),

    openBuzzer: (chancesLeft, answerEndTime) => set({
      chancesLeft,
      answerEndTime,
      answerTimeMs: Math.max(0, answerEndTime - Date.now()),
      phase: 'buzzing',
      buzzerWinner: null,
      buzzerUsername: null,
    }),

    setGameEnd: (result) => set({
      matchResult: result,
      phase: 'finished',
    }),

    setSyncing: (val) => set({ isSyncing: val }),

    reset: () => set(initialState),
  }),
  {
    name: 'game-session',
    // ONLY persist the minimal session keys needed to detect and trigger reconnection.
    // All live game state is re-delivered by the server on rejoin.
    partialize: (state) => ({
      roomCode: state.roomCode,
      mode: state.mode,
      phase: state.phase,
      questionNumber: state.questionNumber,
      totalQuestions: state.totalQuestions,
    }),
  }
))
