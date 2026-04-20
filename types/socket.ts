import type { Question, MatchResult } from './game'

export type SocketEventType =
  | 'connect'
  | 'disconnect'
  | 'connect_error'
  | 'room_created'
  | 'player_joined'
  | 'player_left'
  | 'game_starting'
  | 'question_ready'
  | 'player_answering'
  | 'answer_result'
  | 'question_timeout'
  | 'question_reveal'
  | 'buzzer_open'
  | 'match_results'
  | 'host_changed'
  | 'error'

export interface SocketEvent {
  type: SocketEventType
  payload?: unknown
}

// Emitted by Client
export interface CreateRoomPayload {
  gameType: 'solo' | '1v1' | 'group'
}

export interface JoinRoomPayload {
  roomCode: string
}

export interface SubmitAnswerPayload {
  answer: string
}

// Received from Server
export interface RoomCreatedPayload {
  roomCode: string
  gameType: 'solo' | '1v1' | 'group'
  players: any[]
}

export interface PlayerJoinedPayload {
  userId: string
  username: string
  players: any[]
}

export interface PlayerLeftPayload {
  userId: string
  username: string
  players: any[]
}

export interface GameStartingPayload {
  gameType: 'solo' | '1v1' | 'group'
  totalQuestions: number
  players: any[]
}

export interface QuestionReadyPayload {
  questionIndex: number
  totalQuestions: number
  questionText: string
  readingTimeMs: number
  /** Absolute epoch ms when the reading phase ends. Used for server-authoritative timer. */
  endTime: number
  chancesLeft?: number
  players?: any[]
}

export interface PlayerAnsweringPayload {
  buzzerId: string
  buzzerUsername: string
  answerTimeMs: number
  /** Absolute epoch ms when the answer window ends. */
  endTime: number
}

export interface AnswerResultPayload {
  userId: string
  username: string
  isCorrect: boolean
  correctAnswer: string | null
  chancesLeft: number
  players?: any[]
  timedOut?: boolean
  givenAnswer?: string
}

export interface QuestionTimeoutPayload {
  questionIndex: number
  correctAnswer: string
  explanation: string
}

export interface QuestionRevealPayload {
  questionIndex: number
  correctAnswer: string
  explanation: string
}

export interface BuzzerOpenPayload {
  chancesLeft: number
  answerTimeMs: number
  /** Absolute epoch ms when the buzzer window ends. */
  endTime: number
}

export interface MatchResultsPayload extends MatchResult {}

export interface HostChangedPayload {
  newHostId: string
}

export interface ErrorPayload {
  message: string
}
