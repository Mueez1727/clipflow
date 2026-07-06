'use server'

import {
  getOrCreatePersonalStorage,
  personalVideoWhere,
} from '@/lib/personal-library'
import { client } from '@/lib/prisma'
import { getCurrentDbUser } from '@/lib/server/workspace-helpers'

const empty = {
  personalVideos: [] as { id: string; title: string | null }[],
  personalFolders: [] as { id: string; name: string }[],
  workspaces: [] as { id: string; name: string }[],
  workspaceVideos: [] as {
    id: string
    title: string | null
    workSpaceId: string | null
  }[],
  workspaceTasks: [] as {
    id: string
    title: string
    workSpaceId: string
    status: string
  }[],
}

export const globalSearch = async (rawQuery: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: empty }

    const query = rawQuery.trim()
    if (!query) return { status: 200, data: empty }

    const contains = { contains: query, mode: 'insensitive' as const }
    const lower = query.toLowerCase()

    const storageId = await getOrCreatePersonalStorage(
      dbUser.id,
      dbUser.firstname
    )

    const userWorkspaces = await client.workSpace.findMany({
      where: {
        type: 'PUBLIC',
        OR: [
          { userId: dbUser.id },
          { members: { some: { userId: dbUser.id } } },
        ],
      },
      select: { id: true, name: true },
    })

    const workspaceIds = userWorkspaces.map((w) => w.id)
    const matchingWorkspaces = userWorkspaces.filter((w) =>
      w.name.toLowerCase().includes(lower)
    )

    const [personalVideos, personalFolders, workspaceVideos, workspaceTasks] =
      await Promise.all([
        client.video.findMany({
          where: {
            ...personalVideoWhere(dbUser.id),
            OR: [
              { title: contains },
              { description: contains },
              { tags: { has: query } },
              { tags: { hasSome: [query] } },
            ],
          },
          select: { id: true, title: true },
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
        client.folder.findMany({
          where: {
            workSpaceId: storageId,
            archived: false,
            name: contains,
          },
          select: { id: true, name: true },
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
        workspaceIds.length
          ? client.video.findMany({
              where: {
                OR: [
                  { title: contains },
                  { description: contains },
                  { tags: { has: query } },
                  { tags: { hasSome: [query] } },
                  {
                    workSpaceId: { in: workspaceIds },
                    title: contains,
                  },
                  {
                    sharedIn: {
                      some: { workSpaceId: { in: workspaceIds } },
                    },
                    title: contains,
                  },
                ],
              },
              select: { id: true, title: true, workSpaceId: true },
              take: 8,
              orderBy: { createdAt: 'desc' },
            })
          : Promise.resolve([]),
        workspaceIds.length
          ? client.task.findMany({
              where: {
                workSpaceId: { in: workspaceIds },
                OR: [{ title: contains }, { description: contains }],
              },
              select: {
                id: true,
                title: true,
                workSpaceId: true,
                status: true,
              },
              take: 8,
              orderBy: { updatedAt: 'desc' },
            })
          : Promise.resolve([]),
      ])

    return {
      status: 200,
      data: {
        personalVideos,
        personalFolders,
        workspaces: matchingWorkspaces,
        workspaceVideos,
        workspaceTasks,
      },
    }
  } catch (error) {
    console.log(error)
    return { status: 500, data: empty }
  }
}
