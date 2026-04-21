export type GameMode = 'solo' | '1v1' | 'group'

export type GamePhase = 'matchmaking' | 'waiting' | 'reading' | 'buzzing' | 'answering' | 'reveal' | 'results' | 'finished'

export interface Question {
  id: string
  text: string
  questionText?: string // For compatibility with backend naming
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  correctAnswer: string
  options?: string[]
  timeLimit?: number // in seconds
  points?: number
  explanation?: string
}

export interface AdminQuestion {
  _id: string
  questionText: string
  correctAnswer: string
  explanation?: string
  category?: string
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt?: string
  updatedAt?: string
}

export interface ParticipantScore {
  userId: string
  username: string
  score: number
  correctAnswers: number
  wrongAnswers: number
  averageTime: number
}

export interface MatchResult {
  gameHistoryId: string
  matchId: string
  gameType: GameMode
  participants: ParticipantScore[]
  questions: {
    questionText: string
    correctAnswer: string
    explanation?: string
  }[]
}

export interface BrainRingSubModeConfig {
  id: GameMode
  name: string
  nameUz: string
  description: string
  descriptionUz: string
  icon: 'user' | 'users' | 'user-plus'
}

export const BRAIN_RING_SUB_MODES: BrainRingSubModeConfig[] = [
  {
    id: 'solo',
    name: 'Solo Practice',
    nameUz: 'Yakka mashq',
    description: 'Practice at your own pace',
    descriptionUz: 'O\'zingizga qulay sur\'atda mashq qiling',
    icon: 'user',
  },
  {
    id: '1v1',
    name: '1v1 Match',
    nameUz: '1v1 o\'yin',
    description: 'Face a random opponent',
    descriptionUz: 'Tasodifiy raqib bilan bellashing',
    icon: 'users',
  },
  {
    id: 'group',
    name: 'Play with Friends',
    nameUz: 'Do\'stlar bilan',
    description: 'Share a room code and play together',
    descriptionUz: 'Xona kodi bilan do\'stlaringiz bilan o\'ynang',
    icon: 'user-plus',
  },
]

export const SUB_MODE_INSTRUCTIONS: Record<GameMode, { title: string; rules: string[] }> = {
  solo: {
    title: 'Yakka mashq',
    rules: [
      'Savollar Brain Ring formatida — buzzer va javob vaqti.',
      'Tayyor bo\'lsangiz, o\'yinni boshlang.',
    ],
  },
  '1v1': {
    title: '1v1 Brain Ring',
    rules: [
      'Savol o\'qiladi, so\'ng buzzer ochiladi.',
      'Birinchi bosgan javob beradi; noto\'g\'ri javobda navbat boshqalarga o\'tadi.',
      'G\'olib eng yuqori ball to\'plagan o\'yinchi.',
    ],
  },
  group: {
    title: 'Do\'stlar bilan',
    rules: [
      'Xona kodini ulashing yoki qo\'shilish kodini kiriting.',
      'Xost tayyor bo\'lgach, o\'yin boshlanadi.',
      'Brain Ring qoidalari — buzzer va aniq javob muhim.',
    ],
  },
}

export function formatBrainRingSessionLabel(mode: GameMode | null): string {
  if (!mode) return 'Brain Ring'
  const cfg = BRAIN_RING_SUB_MODES.find((m) => m.id === mode)
  return cfg ? `Brain Ring — ${cfg.nameUz}` : 'Brain Ring'
}
