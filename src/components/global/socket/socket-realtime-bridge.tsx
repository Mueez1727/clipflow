'use client'

import { SOCKET_EVENTS } from '@/lib/socket/events'
import type {
  CommentEventPayload,
  WorkspaceScopedPayload,
} from '@/lib/socket/events'
import { useSocket, useSocketWorkspace } from '@/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

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

  useSocketWorkspace(workspaceId)

  useEffect(() => {
    if (!isConnected) return

    const tasksKey = [`workspace-tasks-${workspaceId}`] as const

    const refreshNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    }

    const refreshComments = (payload: unknown) => {
      if (!isCommentEvent(payload, workspaceId)) return
      queryClient.invalidateQueries({
        queryKey: [`workspace-video-comments-${payload.videoId}`],
      })
      queryClient.invalidateQueries({ queryKey: ['video-comments'] })
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
          queryClient.invalidateQueries({
            queryKey: ['workspace-messages', workspaceId],
          })
        )
      ),
      on(
        SOCKET_EVENTS.videoShared,
        forWorkspace(() => {
          queryClient.invalidateQueries({
            queryKey: ['workspace-videos', workspaceId],
          })
          queryClient.invalidateQueries({
            queryKey: ['workspace-overview', workspaceId],
          })
        })
      ),
      on(
        SOCKET_EVENTS.videoRemoved,
        forWorkspace(() => {
          queryClient.invalidateQueries({
            queryKey: ['workspace-videos', workspaceId],
          })
          queryClient.invalidateQueries({
            queryKey: ['workspace-overview', workspaceId],
          })
        })
      ),
      on(
        SOCKET_EVENTS.videoUpdated,
        forWorkspace(() =>
          queryClient.invalidateQueries({
            queryKey: ['workspace-videos', workspaceId],
          })
        )
      ),
      on(SOCKET_EVENTS.commentAdded, refreshComments),
      on(SOCKET_EVENTS.commentEdited, refreshComments),
      on(SOCKET_EVENTS.commentDeleted, refreshComments),
      on(SOCKET_EVENTS.timestampComment, refreshComments),
      on(
        SOCKET_EVENTS.taskCreated,
        forWorkspace(() =>
          queryClient.invalidateQueries({ queryKey: [...tasksKey] })
        )
      ),
      on(
        SOCKET_EVENTS.taskUpdated,
        forWorkspace(() =>
          queryClient.invalidateQueries({ queryKey: [...tasksKey] })
        )
      ),
      on(
        SOCKET_EVENTS.taskDeleted,
        forWorkspace(() =>
          queryClient.invalidateQueries({ queryKey: [...tasksKey] })
        )
      ),
      on(
        SOCKET_EVENTS.taskMoved,
        forWorkspace(() =>
          queryClient.invalidateQueries({ queryKey: [...tasksKey] })
        )
      ),
      on(
        SOCKET_EVENTS.assignTask,
        forWorkspace(() =>
          queryClient.invalidateQueries({ queryKey: [...tasksKey] })
        )
      ),
      on(
        SOCKET_EVENTS.workspaceActivity,
        forWorkspace(() => {
          queryClient.invalidateQueries({
            queryKey: ['workspace-activity', workspaceId],
          })
          queryClient.invalidateQueries({
            queryKey: ['workspace-analytics', workspaceId],
          })
        })
      ),
      on(SOCKET_EVENTS.newNotification, refreshNotifications),
      on(SOCKET_EVENTS.notificationRead, refreshNotifications),
      on(SOCKET_EVENTS.notificationDeleted, refreshNotifications),
      on(
        SOCKET_EVENTS.memberOnline,
        forWorkspace(() =>
          queryClient.invalidateQueries({
            queryKey: ['workspace-members', workspaceId],
          })
        )
      ),
      on(
        SOCKET_EVENTS.memberOffline,
        forWorkspace(() =>
          queryClient.invalidateQueries({
            queryKey: ['workspace-members', workspaceId],
          })
        )
      ),
      on(
        SOCKET_EVENTS.presenceState,
        forWorkspace(() =>
          queryClient.invalidateQueries({
            queryKey: ['workspace-members', workspaceId],
          })
        )
      ),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [isConnected, on, queryClient, workspaceId])

  return null
}

export default SocketRealtimeBridge
