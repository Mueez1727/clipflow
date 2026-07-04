'use server'

import { client } from '@/lib/prisma'
import {
  createNotification,
  getCurrentDbUser,
  logActivity,
  notifyWorkspaceMembers,
  resolveMentionedUserIds,
} from '@/lib/server/workspace-helpers'

const userSelect = {
  select: {
    id: true,
    firstname: true,
    lastname: true,
    image: true,
  },
} as const

export const getWorkspaceVideoComments = async (videoId: string) => {
  try {
    const dbUser = await getCurrentDbUser()

    const comments = await client.videoComment.findMany({
      where: { videoId },
      include: {
        User: userSelect,
        replies: {
          include: { User: userSelect },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = comments.map((c) => ({
      ...c,
      isOwn: dbUser?.id === c.userId,
      replies: c.replies.map((r) => ({
        ...r,
        isOwn: dbUser?.id === r.userId,
      })),
    }))

    return { status: 200, data }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

const handleMentions = async (
  workspaceId: string | undefined,
  content: string,
  actorId: string,
  actorName: string,
  link: string | null
) => {
  if (!workspaceId) return [] as string[]
  const mentionedIds = await resolveMentionedUserIds(workspaceId, content)
  await Promise.all(
    mentionedIds
      .filter((id) => id !== actorId)
      .map((userId) =>
        createNotification({
          userId,
          actorId,
          type: 'MENTION',
          content: `${actorName} mentioned you in a comment`,
          workspaceId,
          link,
        })
      )
  )
  return mentionedIds
}

export const createVideoComment = async (
  videoId: string,
  content: string,
  workspaceId?: string,
  timestamp?: number | null
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    const trimmed = content.trim()
    if (!trimmed) return { status: 400, data: 'Comment cannot be empty' }

    const comment = await client.videoComment.create({
      data: {
        content: trimmed,
        videoId,
        workSpaceId: workspaceId ?? null,
        userId: dbUser.id,
        timestamp: timestamp ?? null,
      },
      select: { id: true },
    })

    const actorName =
      `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'

    if (workspaceId) {
      const video = await client.video.findUnique({
        where: { id: videoId },
        select: { title: true },
      })
      const link = `/dashboard/${workspaceId}/video/${videoId}`
      const mentionedIds = await handleMentions(
        workspaceId,
        trimmed,
        dbUser.id,
        actorName,
        link
      )
      await logActivity({
        workspaceId,
        type: 'COMMENT_ADDED',
        content: `commented on ${video?.title ?? 'a video'}`,
        userId: dbUser.id,
        videoId,
      })
      await notifyWorkspaceMembers({
        workspaceId,
        actorId: dbUser.id,
        type: 'COMMENT_ADDED',
        content: `${actorName} commented on ${video?.title ?? 'a video'}`,
        link,
        excludeUserIds: mentionedIds,
      })
    }

    return { status: 200, data: comment.id }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to add comment' }
  }
}

export const replyToVideoComment = async (
  commentId: string,
  content: string,
  workspaceId?: string,
  videoId?: string
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    const trimmed = content.trim()
    if (!trimmed) return { status: 400, data: 'Reply cannot be empty' }

    const reply = await client.commentReply.create({
      data: {
        content: trimmed,
        videoCommentId: commentId,
        userId: dbUser.id,
      },
      select: { id: true },
    })

    const actorName =
      `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
    const link =
      workspaceId && videoId
        ? `/dashboard/${workspaceId}/video/${videoId}`
        : null
    await handleMentions(workspaceId, trimmed, dbUser.id, actorName, link)

    return { status: 200, data: reply.id }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to add reply' }
  }
}

export const editVideoComment = async (commentId: string, content: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    const trimmed = content.trim()
    if (!trimmed) return { status: 400, data: 'Comment cannot be empty' }

    const existing = await client.videoComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    })
    if (!existing || existing.userId !== dbUser.id) {
      return { status: 403, data: 'You can only edit your own comment' }
    }

    await client.videoComment.update({
      where: { id: commentId },
      data: { content: trimmed },
    })
    return { status: 200, data: 'Comment updated' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to update comment' }
  }
}

export const deleteVideoComment = async (commentId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const existing = await client.videoComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    })
    if (!existing || existing.userId !== dbUser.id) {
      return { status: 403, data: 'You can only delete your own comment' }
    }

    await client.videoComment.delete({ where: { id: commentId } })
    return { status: 200, data: 'Comment deleted' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to delete comment' }
  }
}

export const editCommentReply = async (replyId: string, content: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    const trimmed = content.trim()
    if (!trimmed) return { status: 400, data: 'Reply cannot be empty' }

    const existing = await client.commentReply.findUnique({
      where: { id: replyId },
      select: { userId: true },
    })
    if (!existing || existing.userId !== dbUser.id) {
      return { status: 403, data: 'You can only edit your own reply' }
    }

    await client.commentReply.update({
      where: { id: replyId },
      data: { content: trimmed },
    })
    return { status: 200, data: 'Reply updated' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to update reply' }
  }
}

export const deleteCommentReply = async (replyId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const existing = await client.commentReply.findUnique({
      where: { id: replyId },
      select: { userId: true },
    })
    if (!existing || existing.userId !== dbUser.id) {
      return { status: 403, data: 'You can only delete your own reply' }
    }

    await client.commentReply.delete({ where: { id: replyId } })
    return { status: 200, data: 'Reply deleted' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to delete reply' }
  }
}
