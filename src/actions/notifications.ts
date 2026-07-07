'use server'

import { client } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/server/workspace-helpers'

export const getUserNotifications = async () => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: [], unread: 0 }

    const notifications = await client.notification.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await client.notification.count({
      where: { userId: dbUser.id, read: false },
    })

    const actorIds = Array.from(
      new Set(notifications.map((n) => n.actorId).filter(Boolean))
    ) as string[]

    const actors = actorIds.length
      ? await client.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, firstname: true, lastname: true, image: true },
        })
      : []
    const actorMap = new Map(actors.map((a) => [a.id, a]))

    const data = notifications.map((n) => ({
      id: n.id,
      content: n.content,
      type: n.type,
      read: n.read,
      link: n.link,
      workSpaceId: n.workSpaceId,
      createdAt: n.createdAt.toISOString(),
      actor: n.actorId ? actorMap.get(n.actorId) ?? null : null,
    }))

    const unread = unreadCount

    return { status: 200, data, unread }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [], unread: 0 }
  }
}

export const getUnreadNotificationCount = async () => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 0 }
    const count = await client.notification.count({
      where: { userId: dbUser.id, read: false },
    })
    return { status: 200, data: count }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 0 }
  }
}

export const markNotificationRead = async (notificationId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    await client.notification.updateMany({
      where: { id: notificationId, userId: dbUser.id },
      data: { read: true },
    })
    return { status: 200, data: 'Marked as read' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed' }
  }
}

export const markAllNotificationsRead = async () => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    await client.notification.updateMany({
      where: { userId: dbUser.id, read: false },
      data: { read: true },
    })
    return { status: 200, data: 'All marked as read' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed' }
  }
}
