'use server'

import { client } from '@/lib/prisma'
import {
  createNotification,
  getCurrentDbUser,
  logActivity,
} from '@/lib/server/workspace-helpers'
import { REVIEW_STATUS } from '@prisma/client'

const ensureSharedVideo = async (
  videoId: string,
  workspaceId: string,
  sharedById: string
) => {
  return client.sharedVideo.upsert({
    where: { videoId_workSpaceId: { videoId, workSpaceId: workspaceId } },
    update: {},
    create: { videoId, workSpaceId: workspaceId, sharedById },
    select: { id: true },
  })
}

const actorName = (u: { firstname: string | null; lastname: string | null }) =>
  `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || 'Someone'

export const setReviewStatus = async (
  videoId: string,
  workspaceId: string,
  status: REVIEW_STATUS,
  note?: string
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    if (status === 'NEEDS_CHANGES' && !note?.trim()) {
      return { status: 400, data: 'A comment is required to request changes' }
    }

    await ensureSharedVideo(videoId, workspaceId, dbUser.id)

    await client.sharedVideo.update({
      where: { videoId_workSpaceId: { videoId, workSpaceId: workspaceId } },
      data: {
        reviewStatus: status,
        reviewNote: note?.trim() || null,
        reviewedById: dbUser.id,
      },
    })

    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { title: true, userId: true },
    })

    const link = `/dashboard/${workspaceId}/video/${videoId}`

    if (status === 'APPROVED') {
      await logActivity({
        workspaceId,
        type: 'VIDEO_APPROVED',
        content: `approved ${video?.title ?? 'a video'}`,
        userId: dbUser.id,
        videoId,
      })
      if (video?.userId && video.userId !== dbUser.id) {
        await createNotification({
          userId: video.userId,
          actorId: dbUser.id,
          type: 'VIDEO_APPROVED',
          content: `${actorName(dbUser)} approved ${video.title ?? 'your video'}`,
          workspaceId,
          link,
        })
      }
    }

    if (status === 'NEEDS_CHANGES' && video?.userId && video.userId !== dbUser.id) {
      await createNotification({
        userId: video.userId,
        actorId: dbUser.id,
        type: 'VIDEO_NEEDS_CHANGES',
        content: `${actorName(dbUser)} requested changes on ${
          video.title ?? 'your video'
        }: ${note?.trim()}`,
        workspaceId,
        link,
      })
    }

    return { status: 200, data: 'Review updated' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to update review status' }
  }
}

export const togglePinVideo = async (videoId: string, workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    await ensureSharedVideo(videoId, workspaceId, dbUser.id)

    const current = await client.sharedVideo.findUnique({
      where: { videoId_workSpaceId: { videoId, workSpaceId: workspaceId } },
      select: { pinned: true },
    })

    const nextPinned = !current?.pinned

    await client.sharedVideo.update({
      where: { videoId_workSpaceId: { videoId, workSpaceId: workspaceId } },
      data: { pinned: nextPinned },
    })

    if (nextPinned) {
      const video = await client.video.findUnique({
        where: { id: videoId },
        select: { title: true },
      })
      await logActivity({
        workspaceId,
        type: 'VIDEO_PINNED',
        content: `pinned ${video?.title ?? 'a video'}`,
        userId: dbUser.id,
        videoId,
      })
    }

    return { status: 200, data: nextPinned ? 'Video pinned' : 'Video unpinned' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to pin video' }
  }
}
