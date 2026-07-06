'use client'

import { SOCKET_EVENTS } from '@/lib/socket/events'
import type {
  CommentEventPayload,
  WorkspaceScopedPayload,
} from '@/lib/socket/events'
import { useSocket, useSocketWorkspace } from '@/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

type SocketRealtimeBridgeProps = {
  workspaceId: string
}

const isWorkspaceEvent = (
  payload: unknown,
  workspaceId: string
): payload is WorkspaceScopedPayload =>
  typeof payload === 'object' &&
  payload !== null &&
  'workspaceId' in payload &&
  (payload as WorkspaceScopedPayload).workspaceId === workspaceId

const isCommentEvent = (
  payload: unknown,
  workspaceId: string
): payload is CommentEventPayload =>
  isWorkspaceEvent(payload, workspaceId) &&
  'videoId' in payload &&
  typeof (payload as CommentEventPayload).videoId === 'string'

/**
 * Subscribes to collaboration socket events and refreshes React Query caches.
 * Renders nothing — no UI changes.
 */
const SocketRealtimeBridge = ({ workspaceId }: SocketRealtimeBridgeProps) => {
  const { on, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const invalidateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  useSocketWorkspace(workspaceId)

  useEffect(() => {
    if (!isConnected) return

    const tasksKey = [`workspace-tasks-${workspaceId}`] as const

    const debouncedInvalidate = (queryKey: readonly unknown[], delay = 350) => {
      const key = JSON.stringify(queryKey)
      const existing = invalidateTimers.current.get(key)
      if (existing) clearTimeout(existing)
      invalidateTimers.current.set(
        key,
        setTimeout(() => {
          invalidateTimers.current.delete(key)
          void queryClient.invalidateQueries({ queryKey: [...queryKey] })
        }, delay)
      )
    }

    const refreshNotifications = () => {
      debouncedInvalidate(['user-notifications'])
    }

    const refreshComments = (payload: unknown) => {
      if (!isCommentEvent(payload, workspaceId)) return
      debouncedInvalidate([`workspace-video-comments-${payload.videoId}`])
      debouncedInvalidate(['video-comments'])
    }

    const forWorkspace =
      (handler: () => void) =>
      (payload: unknown) => {
        if (isWorkspaceEvent(payload, workspaceId)) handler()
      }

    const unsubscribers = [
      on(
        SOCKET_EVENTS.receiveMessage,
        forWorkspace(() =>
          debouncedInvalidate(['workspace-messages', workspaceId])
        )
      ),
      on(
        SOCKET_EVENTS.videoShared,
        forWorkspace(() => {
          debouncedInvalidate(['workspace-videos', workspaceId])
          debouncedInvalidate(['workspace-overview', workspaceId])
        })
      ),
      on(
        SOCKET_EVENTS.videoRemoved,
        forWorkspace(() => {
          debouncedInvalidate(['workspace-videos', workspaceId])
          debouncedInvalidate(['workspace-overview', workspaceId])
        })
      ),
      on(
        SOCKET_EVENTS.videoUpdated,
        forWorkspace(() =>
          debouncedInvalidate(['workspace-videos', workspaceId])
        )
      ),
      on(SOCKET_EVENTS.commentAdded, refreshComments),
      on(SOCKET_EVENTS.commentEdited, refreshComments),
      on(SOCKET_EVENTS.commentDeleted, refreshComments),
      on(SOCKET_EVENTS.timestampComment, refreshComments),
      on(
        SOCKET_EVENTS.taskCreated,
        forWorkspace(() => debouncedInvalidate([...tasksKey]))
      ),
      on(
        SOCKET_EVENTS.taskUpdated,
        forWorkspace(() => debouncedInvalidate([...tasksKey]))
      ),
      on(
        SOCKET_EVENTS.taskDeleted,
        forWorkspace(() => debouncedInvalidate([...tasksKey]))
      ),
      on(
        SOCKET_EVENTS.taskMoved,
        forWorkspace(() => debouncedInvalidate([...tasksKey]))
      ),
      on(
        SOCKET_EVENTS.assignTask,
        forWorkspace(() => debouncedInvalidate([...tasksKey]))
      ),
      on(
        SOCKET_EVENTS.workspaceActivity,
        forWorkspace(() => {
          debouncedInvalidate(['workspace-activity', workspaceId])
          debouncedInvalidate(['workspace-analytics', workspaceId])
        })
      ),
      on(SOCKET_EVENTS.newNotification, refreshNotifications),
      on(SOCKET_EVENTS.notificationRead, refreshNotifications),
      on(SOCKET_EVENTS.notificationDeleted, refreshNotifications),
      on(
        SOCKET_EVENTS.memberOnline,
        forWorkspace(() =>
          debouncedInvalidate(['workspace-members', workspaceId])
        )
      ),
      on(
        SOCKET_EVENTS.memberOffline,
        forWorkspace(() =>
          debouncedInvalidate(['workspace-members', workspaceId])
        )
      ),
      on(
        SOCKET_EVENTS.presenceState,
        forWorkspace(() =>
          debouncedInvalidate(['workspace-members', workspaceId])
        )
      ),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      const timers = invalidateTimers.current
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [isConnected, on, queryClient, workspaceId])

  return null
}

export default SocketRealtimeBridge
