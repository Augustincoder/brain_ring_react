import { io, Socket } from 'socket.io-client'
import type { SocketEventType } from '@/types/socket'
import { useUserStore } from '@/store/user-store'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

let socketInstance: GameSocket | null = null

export class GameSocket {
  private socket: Socket | null = null
  private eventListeners: Map<SocketEventType, Array<(payload: any) => void>> = new Map()

  async connect(): Promise<void> {
    if (this.socket?.connected) return

    const token = useUserStore.getState().token
    if (!token) {
      throw new Error('Not authenticated')
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    // Flus buffered listeners immediately upon socket creation
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket?.on(event, cb))
    })

    return new Promise((resolve, reject) => {
      this.socket?.on('connect', () => resolve())
      this.socket?.on('connect_error', (err) => reject(err))
    })
  }

  isConnected(): boolean {
    return this.socket?.connected === true
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: SocketEventType, callback: (payload: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
    
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: SocketEventType, callback?: (payload: any) => void): void {
    if (callback) {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            this.eventListeners.set(event, listeners.filter((cb) => cb !== callback))
        }
        this.socket?.off(event, callback)
    } else {
        this.eventListeners.delete(event)
        this.socket?.off(event)
    }
  }

  // Outbound events matching new backend
  createRoom(gameType: 'solo' | '1v1' | 'group'): void {
    this.socket?.emit('create_room', { gameType })
  }

  joinRoom(roomCode: string): void {
    this.socket?.emit('join_room', { roomCode })
  }

  /**
   * Re-emits join_room after a browser refresh.
   * The backend's join_room handler detects the existing player and
   * re-delivers the full current game state (question_ready, buzzer_open, etc.).
   */
  rejoinRoom(roomCode: string): void {
    this.socket?.emit('join_room', { roomCode })
  }

  startGame(): void {
    this.socket?.emit('start_game')
  }

  buzzIn(): void {
    this.socket?.emit('buzz_in')
  }

  submitAnswer(answer: string): void {
    this.socket?.emit('submit_answer', { answer })
  }
}

export const getGameSocket = (): GameSocket => {
  if (!socketInstance) {
    socketInstance = new GameSocket()
  }
  return socketInstance
}

export const resetGameSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
