'use client'

/**
 * Optimized Zustand selectors to prevent unnecessary re-renders
 * Each hook subscribes to only the specific slice of state it needs
 */

import { useGameStore } from '@/store/game-store'
import { useUserStore } from '@/store/user-store'
import { shallow } from 'zustand/shallow'

/**
 * ✅ OPTIMIZED: Buzzer state hook
 * Combines all buzzer-related state in a single subscription
 */
export const useBuzzerState = () => {
  return useGameStore(
    (state) => ({
      phase: state.phase,
      currentPhase: state.currentPhase,
      buzzerWinner: state.buzzerWinner,
      buzzerLockedBy: state.buzzerLockedBy,
      buzzerLocked: state.buzzerLocked,
      lockedPlayers: state.lockedPlayers,
    }),
    shallow // ✅ Only re-render if values actually change
  )
}

/**
 * ✅ OPTIMIZED: Question state hook
 */
export const useQuestionState = () => {
  return useGameStore(
    (state) => ({
      currentQuestion: state.currentQuestion,
      questionNumber: state.questionNumber,
      totalQuestions: state.totalQuestions,
      timeRemaining: state.timeRemaining,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: Answer state hook
 */
export const useAnswerState = () => {
  return useGameStore(
    (state) => ({
      submittedAnswer: state.submittedAnswer,
      isCorrect: state.isCorrect,
      correctAnswer: state.correctAnswer,
      answeredPlayerId: state.answeredPlayerId,
      pointsEarned: state.pointsEarned,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: Score state hook
 */
export const useScoreState = () => {
  const userId = useUserStore((state) => state.id)
  
  return useGameStore(
    (state) => ({
      scores: state.scores,
      userScore: state.scores[userId || 'user'] || 0,
      mmrChanges: state.mmrChanges,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: Game session hook
 */
export const useGameSession = () => {
  return useGameStore(
    (state) => ({
      roomId: state.roomId,
      mode: state.mode,
      players: state.players,
      phase: state.phase,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: Results state hook
 */
export const useResultsState = () => {
  return useGameStore(
    (state) => ({
      finalScores: state.finalScores,
      mmrChanges: state.mmrChanges,
      winner: state.winner,
      roundResults: state.roundResults,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: Timer state hook
 */
export const useTimerState = () => {
  return useGameStore(
    (state) => ({
      timeRemaining: state.timeRemaining,
      timerActive: state.timerActive,
      dynamicTimerMs: state.dynamicTimerMs,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: User profile hook
 */
export const useUserProfile = () => {
  return useUserStore(
    (state) => ({
      id: state.id,
      username: state.username,
      avatar: state.avatar,
      mmr: state.mmr,
    }),
    shallow
  )
}

/**
 * ✅ OPTIMIZED: User stats hook
 */
export const useUserStats = () => {
  return useUserStore(
    (state) => ({
      mmr: state.mmr,
      gamesPlayed: state.gamesPlayed,
      wins: state.wins,
      losses: state.losses,
    }),
    shallow
  )
}