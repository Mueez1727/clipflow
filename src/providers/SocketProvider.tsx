'use client'

import { useAuth } from '@clerk/nextjs'
import { io, Socket } from 'socket.io-client'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { SocketEventName, SocketListener } from '@/lib/socket/events'

type ListenerRegistry = Map<string, Set<SocketListener>>

export type SocketContextValue = {
  socket: Socket | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  emit: (event: SocketEventName | string, ...args: unknown[]) => void
  on: (
    event: SocketEventName | string,
    handler: SocketListener
  ) => () => void
  off: (event: SocketEventName | string, handler?: SocketListener) => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

const resolveSocketUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim()
  return configured || null
}

const attachRegistry = (socket: Socket, registry: ListenerRegistry) => {
  Array.from(registry.entries()).forEach(([event, handlers]) => {
    handlers.forEach((handler) => {
      socket.off(event, handler)
      socket.on(event, handler)
    })
  })
}

type SocketProviderProps = {
  children: React.ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<ListenerRegistry>(new Map())
  const connectingRef = useRef(false)

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const off = useCallback(
    (event: SocketEventName | string, handler?: SocketListener) => {
      const registry = listenersRef.current
      const handlers = registry.get(event)

      if (!handler) {
        handlers?.forEach((registered) => {
          socketRef.current?.off(event, registered)
        })
        registry.delete(event)
        return
      }

      handlers?.delete(handler)
      if (handlers?.size === 0) registry.delete(event)
      socketRef.current?.off(event, handler)
    },
    []
  )

  const on = useCallback(
    (event: SocketEventName | string, handler: SocketListener) => {
      const registry = listenersRef.current
      let handlers = registry.get(event)

      if (!handlers) {
        handlers = new Set()
        registry.set(event, handlers)
      }

      if (!handlers.has(handler)) {
        handlers.add(handler)
        socketRef.current?.on(event, handler)
      }

      return () => off(event, handler)
    },
    [off]
  )

  const emit = useCallback(
    (event: SocketEventName | string, ...args: unknown[]) => {
      socketRef.current?.emit(event, ...args)
    },
    []
  )

  const disconnect = useCallback(() => {
    connectingRef.current = false
    const active = socketRef.current
    if (!active) return

    active.removeAllListeners('connect')
    active.removeAllListeners('disconnect')
    active.io.removeAllListeners('reconnect_attempt')
    active.disconnect()
    socketRef.current = null
    setSocket(null)
    setIsConnected(false)
  }, [])

  const connect = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return
    if (connectingRef.current) return

    const socketUrl = resolveSocketUrl()
    if (!socketUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Socket] NEXT_PUBLIC_SOCKET_URL is not configured')
      }
      return
    }

    const token = await getToken()
    if (!token) return

    connectingRef.current = true

    try {
      let active = socketRef.current

      if (active) {
        active.auth = { token }
        if (!active.connected) active.connect()
        return
      }

      active = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        autoConnect: false,
      })

      active.on('connect', () => setIsConnected(true))
      active.on('disconnect', () => setIsConnected(false))

      active.io.on('reconnect_attempt', async () => {
        const freshToken = await getToken()
        if (freshToken) active!.auth = { token: freshToken }
      })

      attachRegistry(active, listenersRef.current)

      socketRef.current = active
      setSocket(active)
      active.connect()
    } finally {
      connectingRef.current = false
    }
  }, [getToken, isLoaded, isSignedIn])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      disconnect()
      return
    }

    void connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect, isLoaded, isSignedIn])

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      isConnected,
      connect,
      disconnect,
      emit,
      on,
      off,
    }),
    [socket, isConnected, connect, disconnect, emit, on, off]
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
