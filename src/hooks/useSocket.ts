'use client'

import {
  SOCKET_EVENTS,
  type JoinWorkspacePayload,
  type LeaveWorkspacePayload,
} from '@/lib/socket/events'
import { useSocketContext } from '@/providers/SocketProvider'
import { useEffect, useRef } from 'react'

/**
 * Joins the active workspace room and leaves the previous one when the
 * workspace changes or the component unmounts.
 */
export const useSocketWorkspace = (workspaceId: string | null | undefined) => {
  const { emit, isConnected } = useSocketContext()
  const previousWorkspaceRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !workspaceId) return

    const previous = previousWorkspaceRef.current
    if (previous && previous !== workspaceId) {
      emit(SOCKET_EVENTS.leaveWorkspace, {
        workspaceId: previous,
      } satisfies LeaveWorkspacePayload)
    }

    emit(SOCKET_EVENTS.joinWorkspace, {
      workspaceId,
    } satisfies JoinWorkspacePayload)

    previousWorkspaceRef.current = workspaceId

    return () => {
      if (previousWorkspaceRef.current) {
        emit(SOCKET_EVENTS.leaveWorkspace, {
          workspaceId: previousWorkspaceRef.current,
        } satisfies LeaveWorkspacePayload)
        previousWorkspaceRef.current = null
      }
    }
  }, [emit, isConnected, workspaceId])
}

/**
 * Single application-wide Socket.IO connection via React Context.
 */
export const useSocket = () => useSocketContext()
