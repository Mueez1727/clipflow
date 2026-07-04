'use server'

import { client } from '@/lib/prisma'

const DAY_MS = 24 * 60 * 60 * 1000
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const buildWeekBuckets = () => {
  const buckets: { label: string; start: number; end: number; value: number }[] =
    []
  const now = new Date()
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  for (let i = 6; i >= 0; i--) {
    const start = todayStart - i * DAY_MS
    buckets.push({
      label: DAY_LABELS[new Date(start).getDay()],
      start,
      end: start + DAY_MS,
      value: 0,
    })
  }
  return buckets
}

const bucketize = (dates: Date[]) => {
  const buckets = buildWeekBuckets()
  for (const date of dates) {
    const t = date.getTime()
    const bucket = buckets.find((b) => t >= b.start && t < b.end)
    if (bucket) bucket.value += 1
  }
  return buckets.map(({ label, value }) => ({ label, value }))
}

export const getWorkspaceAnalytics = async (workspaceId: string) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * DAY_MS)

    const [
      workspace,
      videosThisWeek,
      videosShared,
      tasksCompleted,
      pendingTasks,
      recentVideos,
      recentActivities,
      mostActiveGroup,
    ] = await Promise.all([
      client.workSpace.findUnique({
        where: { id: workspaceId },
        select: { _count: { select: { members: true } } },
      }),
      client.video.count({
        where: { workSpaceId: workspaceId, createdAt: { gte: weekAgo } },
      }),
      client.sharedVideo.count({ where: { workSpaceId: workspaceId } }),
      client.task.count({
        where: { workSpaceId: workspaceId, status: 'DONE' },
      }),
      client.task.count({
        where: { workSpaceId: workspaceId, status: { not: 'DONE' } },
      }),
      client.video.findMany({
        where: { workSpaceId: workspaceId, createdAt: { gte: weekAgo } },
        select: { createdAt: true, views: true },
      }),
      client.activity.findMany({
        where: { workSpaceId: workspaceId, createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
      client.activity.groupBy({
        by: ['userId'],
        where: { workSpaceId: workspaceId, userId: { not: null } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 1,
      }),
    ])

    let mostActiveMember: string | null = null
    if (mostActiveGroup.length > 0 && mostActiveGroup[0].userId) {
      const activeUser = await client.user.findUnique({
        where: { id: mostActiveGroup[0].userId },
        select: { firstname: true, lastname: true, email: true },
      })
      if (activeUser) {
        mostActiveMember =
          `${activeUser.firstname ?? ''} ${activeUser.lastname ?? ''}`.trim() ||
          activeUser.email.split('@')[0]
      }
    }

    const totalViews = recentVideos.reduce((sum, v) => sum + v.views, 0)

    const weeklyUploads = bucketize(recentVideos.map((v) => v.createdAt))
    const weeklyActivity = bucketize(recentActivities.map((a) => a.createdAt))

    return {
      status: 200,
      data: {
        cards: {
          videosThisWeek,
          videosShared,
          watchTime: null as string | null,
          storageUsed: null as string | null,
          members: workspace?._count.members ?? 0,
          mostActiveMember,
          tasksCompleted,
          pendingTasks,
          totalViews,
        },
        weeklyUploads,
        weeklyActivity,
        recordingTrend: weeklyUploads,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      data: {
        cards: {
          videosThisWeek: 0,
          videosShared: 0,
          watchTime: null as string | null,
          storageUsed: null as string | null,
          members: 0,
          mostActiveMember: null,
          tasksCompleted: 0,
          pendingTasks: 0,
          totalViews: 0,
        },
        weeklyUploads: [],
        weeklyActivity: [],
        recordingTrend: [],
      },
    }
  }
}
