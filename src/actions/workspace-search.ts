'use server'

import { client } from '@/lib/prisma'

export const searchWorkspace = async (workspaceId: string, rawQuery: string) => {
  try {
    const query = rawQuery.trim()
    if (!query) {
      return {
        status: 200,
        data: { videos: [], tasks: [], comments: [], members: [], messages: [] },
      }
    }

    const contains = { contains: query, mode: 'insensitive' as const }

    const [videos, tasks, comments, messages, workspace] = await Promise.all([
      client.video.findMany({
        where: {
          title: contains,
          OR: [
            { workSpaceId: workspaceId },
            { sharedIn: { some: { workSpaceId: workspaceId } } },
          ],
        },
        select: { id: true, title: true, source: true },
        take: 8,
      }),
      client.task.findMany({
        where: {
          workSpaceId: workspaceId,
          OR: [{ title: contains }, { description: contains }],
        },
        select: { id: true, title: true, status: true, priority: true },
        take: 8,
      }),
      client.videoComment.findMany({
        where: { workSpaceId: workspaceId, content: contains },
        select: {
          id: true,
          content: true,
          videoId: true,
          User: { select: { firstname: true, lastname: true } },
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      client.message.findMany({
        where: { workSpaceId: workspaceId, content: contains },
        select: {
          id: true,
          content: true,
          User: { select: { firstname: true, lastname: true } },
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      client.workSpace.findUnique({
        where: { id: workspaceId },
        select: {
          User: {
            select: { id: true, firstname: true, lastname: true, image: true, email: true },
          },
          members: {
            select: {
              User: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  image: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ])

    const lower = query.toLowerCase()
    const memberCandidates = [
      ...(workspace?.User ? [workspace.User] : []),
      ...(workspace?.members.map((m) => m.User).filter(Boolean) ?? []),
    ] as {
      id: string
      firstname: string | null
      lastname: string | null
      image: string | null
      email: string
    }[]

    const seen = new Set<string>()
    const members = memberCandidates.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      const name = `${m.firstname ?? ''} ${m.lastname ?? ''}`.toLowerCase()
      return name.includes(lower) || m.email.toLowerCase().includes(lower)
    })

    return {
      status: 200,
      data: { videos, tasks, comments, members, messages },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      data: { videos: [], tasks: [], comments: [], members: [], messages: [] },
    }
  }
}
