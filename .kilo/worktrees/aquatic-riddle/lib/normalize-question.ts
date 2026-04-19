import type { GameMode, Question } from '@/types/game'

type UnknownRecord = Record<string, any>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v
  }
  return null
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const strings = value.filter((v) => typeof v === 'string') as string[]
  return strings.length ? strings : undefined
}

export function normalizeQuestion(
  rawPayload: unknown,
  _mode: GameMode | null,
  ctx?: { questionNumber?: number }
): Question {
  const defaultTimeLimit = 15

  if (isRecord(rawPayload) && typeof rawPayload.text === 'string' && typeof rawPayload.id === 'string') {
    const q = rawPayload as UnknownRecord
    return {
      id: q.id,
      text: q.text,
      category: firstString(q.category) ?? 'General',
      difficulty: (q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard')
        ? q.difficulty
        : 'medium',
      correctAnswer: firstString(q.correctAnswer, q.answer) ?? '',
      options: asStringArray(q.options),
      timeLimit: typeof q.timeLimit === 'number' ? q.timeLimit : defaultTimeLimit,
      points: typeof q.points === 'number' ? q.points : (typeof q.pointValue === 'number' ? q.pointValue : 1),
    }
  }

  const root = isRecord(rawPayload) ? rawPayload : {}
  const qObj = isRecord(root.question) ? (root.question as UnknownRecord) : undefined

  const extractedText =
    firstString(
      (qObj && qObj.question),
      (qObj && isRecord(qObj.question) ? qObj.question.question : undefined),
      (root as any).question,
    ) ??
    firstString(
      qObj && Array.isArray(qObj.questions) ? qObj.questions?.[0]?.question : undefined,
      Array.isArray((root as any).questions) ? (root as any).questions?.[0]?.question : undefined,
    ) ??
    firstString(
      qObj && isRecord(qObj.questions) ? qObj.questions?.['10']?.q : undefined,
      isRecord((root as any).questions) ? (root as any).questions?.['10']?.q : undefined,
    ) ??
    firstString((root as any).text, qObj?.text) ??
    ''

  const extractedCorrectAnswer =
    firstString(
      (root as any).correctAnswer,
      (root as any).answer,
      qObj?.correctAnswer,
      qObj?.answer,
      qObj && isRecord(qObj.questions) ? qObj.questions?.['10']?.a : undefined
    ) ?? ''

  const extractedOptions =
    asStringArray((root as any).options) ??
    asStringArray(qObj?.options) ??
    asStringArray((root as any).answers) ??
    asStringArray(qObj?.answers)

  const questionNumber = ctx?.questionNumber ?? (typeof (root as any).questionNumber === 'number' ? (root as any).questionNumber : undefined)
  const fallbackId = typeof (root as any).id === 'string'
    ? (root as any).id
    : typeof qObj?.id === 'string'
      ? qObj.id
      : `q_${Math.max(0, (questionNumber ?? 1) - 1)}`

  const fallbackTimeLimit =
    typeof (root as any).timeLimit === 'number'
      ? (root as any).timeLimit
      : typeof qObj?.timeLimit === 'number'
        ? qObj.timeLimit
        : defaultTimeLimit

  const fallbackPoints =
    typeof (root as any).points === 'number'
      ? (root as any).points
      : typeof qObj?.points === 'number'
        ? qObj.points
        : typeof (root as any).pointValue === 'number'
          ? (root as any).pointValue
          : 1

  return {
    id: fallbackId,
    text: extractedText,
    category: firstString((root as any).category, qObj?.category) ?? 'General',
    difficulty: 'medium',
    correctAnswer: extractedCorrectAnswer,
    options: extractedOptions,
    timeLimit: fallbackTimeLimit,
    points: fallbackPoints,
  }
}
