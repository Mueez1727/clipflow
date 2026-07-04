'use server'

import { client } from '@/lib/prisma'

export const getWorkspaceActivity = async (
  workspaceId: string,
  limit = 50
) => {
  try {
    const activities = await client.activity.findMany({
      where: { workSpaceId: workspaceId },
      include: {
        User: {
          select: { firstname: true, lastname: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return { status: 200, data: activities }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}
