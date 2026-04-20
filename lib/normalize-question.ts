import type { Question } from '@/types/game'

export function normalizeQuestion(rawPayload: any): Question {
  return {
    id: rawPayload.id || `q_${Date.now()}`,
    text: rawPayload.questionText || rawPayload.text || '',
    category: rawPayload.category || 'General',
    difficulty: rawPayload.difficulty || 'medium',
    correctAnswer: rawPayload.correctAnswer || '',
    options: rawPayload.options || [],
    timeLimit: rawPayload.timeLimit || 15,
    points: rawPayload.points || 1,
    explanation: rawPayload.explanation || '',
  }
}
