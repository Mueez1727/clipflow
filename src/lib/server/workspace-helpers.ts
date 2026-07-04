import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { cache } from 'react'

export type DbUser = {
  id: string
  firstname: string | null
  lastname: string | null
  image: string | null
  email: string
}

// Wrapped in React cache() so repeated calls within a single server request
// (e.g. an action that triggers several helpers) hit the database only once.
export const getCurrentDbUser = cache(async (): Promise<DbUser | null> => {
  const user = await currentUser()
  if (!user) return null
  return client.user.findUnique({
    where: { clerkid: user.id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      image: true,
      email: true,
    },
  })
})

export const getWorkspaceMemberIds = async (workspaceId: string) => {
  const workspace = await client.workSpace.findUnique({
    where: { id: workspaceId },
    select: {
      userId: true,
      members: { select: { userId: true } },
    },
  })
  if (!workspace) return [] as string[]
  const ids = new Set<string>()
  if (workspace.userId) ids.add(workspace.userId)
  for (const m of workspace.members) {
    if (m.userId) ids.add(m.userId)
  }
  return Array.from(ids)
}

type ActivityType =
  | 'VIDEO_SHARED'
  | 'COMMENT_ADDED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'WORKSPACE_JOINED'
  | 'VIDEO_APPROVED'
  | 'VIDEO_PINNED'

export const logActivity = async (input: {
  workspaceId: string
  type: ActivityType
  content: string
  userId?: string | null
  videoId?: string | null
}) => {
  try {
    await client.activity.create({
      data: {
        workSpaceId: input.workspaceId,
        type: input.type,
        content: input.content,
        userId: input.userId ?? null,
        videoId: input.videoId ?? null,
      },
    })
  } catch (error) {
    console.log('logActivity error', error)
  }
}

type NotificationType =
  | 'WORKSPACE_JOINED'
  | 'COMMENT_ADDED'
  | 'VIDEO_SHARED'
  | 'TASK_ASSIGNED'
  | 'MENTION'
  | 'VIDEO_APPROVED'
  | 'VIDEO_NEEDS_CHANGES'

export const createNotification = async (input: {
  userId: string
  actorId?: string | null
  type: NotificationType
  content: string
  workspaceId?: string | null
  link?: string | null
}) => {
  try {
    await client.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId ?? null,
        type: input.type,
        content: input.content,
        workSpaceId: input.workspaceId ?? null,
        link: input.link ?? null,
      },
    })
  } catch (error) {
    console.log('createNotification error', error)
  }
}

export const notifyWorkspaceMembers = async (input: {
  workspaceId: string
  actorId: string
  type: NotificationType
  content: string
  link?: string | null
  excludeUserIds?: string[]
}) => {
  const memberIds = await getWorkspaceMemberIds(input.workspaceId)
  const exclude = new Set([input.actorId, ...(input.excludeUserIds ?? [])])
  const recipients = memberIds.filter((id) => !exclude.has(id))

  if (recipients.length === 0) return

  await client.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      actorId: input.actorId,
      type: input.type,
      content: input.content,
      workSpaceId: input.workspaceId,
      link: input.link ?? null,
    })),
  })
}

export const extractMentionTokens = (content: string): string[] => {
  const matches = content.match(/@([a-zA-Z0-9_.-]+)/g)
  if (!matches) return []
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())))
}

export const resolveMentionedUserIds = async (
  workspaceId: string,
  content: string
): Promise<string[]> => {
  const tokens = extractMentionTokens(content)
  if (tokens.length === 0) return []

  const workspace = await client.workSpace.findUnique({
    where: { id: workspaceId },
    select: {
      User: { select: { id: true, firstname: true, email: true } },
      members: {
        select: {
          User: { select: { id: true, firstname: true, email: true } },
        },
      },
    },
  })
  if (!workspace) return []

  const candidates: { id: string; firstname: string | null; email: string }[] = []
  if (workspace.User) candidates.push(workspace.User)
  for (const m of workspace.members) {
    if (m.User) candidates.push(m.User)
  }

  const matchedIds = new Set<string>()
  for (const candidate of candidates) {
    const handle = (candidate.firstname ?? candidate.email.split('@')[0])
      .toLowerCase()
      .replace(/\s+/g, '')
    const emailLocal = candidate.email.split('@')[0].toLowerCase()
    if (tokens.includes(handle) || tokens.includes(emailLocal)) {
      matchedIds.add(candidate.id)
    }
  }
  return Array.from(matchedIds)
}
