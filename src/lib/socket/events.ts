export const SOCKET_EVENTS = {
  // Client → server
  joinWorkspace: 'joinWorkspace',
  leaveWorkspace: 'leaveWorkspace',
  sendMessage: 'sendMessage',
  typingStart: 'typingStart',
  typingStop: 'typingStop',

  // Server → client
  receiveMessage: 'receiveMessage',
  memberOnline: 'memberOnline',
  memberOffline: 'memberOffline',
  presenceState: 'presenceState',
  videoShared: 'videoShared',
  videoRemoved: 'videoRemoved',
  videoUpdated: 'videoUpdated',
  commentAdded: 'commentAdded',
  commentEdited: 'commentEdited',
  commentDeleted: 'commentDeleted',
  timestampComment: 'timestampComment',
  taskCreated: 'taskCreated',
  taskUpdated: 'taskUpdated',
  taskDeleted: 'taskDeleted',
  taskMoved: 'taskMoved',
  assignTask: 'assignTask',
  workspaceActivity: 'workspaceActivity',
  newNotification: 'newNotification',
  notificationRead: 'notificationRead',
  notificationDeleted: 'notificationDeleted',
  socketError: 'socketError',
} as const

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]

export type SocketListener = (...args: unknown[]) => void

export type JoinWorkspacePayload = {
  workspaceId: string
}

export type LeaveWorkspacePayload = {
  workspaceId: string
}

export type SendMessagePayload = {
  workspaceId: string
  content: string
}

export type TypingPayload = {
  workspaceId: string
}

export type WorkspaceScopedPayload = {
  workspaceId: string
}

export type VideoEventPayload = WorkspaceScopedPayload & {
  videoId: string
}

export type CommentEventPayload = WorkspaceScopedPayload & {
  videoId: string
  commentId: string
}

export type TaskEventPayload = WorkspaceScopedPayload & {
  taskId: string
}

export type NotificationEventPayload = {
  notificationId: string
  workspaceId?: string
}

export type SocketErrorPayload = {
  message: string
  code?: string
}
