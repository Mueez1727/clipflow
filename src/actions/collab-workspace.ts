'use server'

import { client } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import {
  createNotification,
  getCurrentDbUser,
  hasWorkspaceAccess,
  logActivity,
  notifyWorkspaceMembers,
  resolveMentionedUserIds,
} from '@/lib/server/workspace-helpers'

const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const createUniqueJoinCode = async () => {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateJoinCode()
    const existing = await client.workSpace.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    })
    if (!existing) return code
  }
  return `${generateJoinCode()}${Date.now().toString(36).toUpperCase()}`
}

export const createCollabWorkspace = async (name: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const trimmed = name.trim()
    if (!trimmed) return { status: 400, data: 'Workspace name is required' }

    const inviteCode = await createUniqueJoinCode()

    const workspace = await client.workSpace.create({
      data: {
        name: trimmed,
        type: 'PUBLIC',
        inviteCode,
        userId: dbUser.id,
        members: {
          create: {
            userId: dbUser.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
      },
    })

    return { status: 201, data: workspace }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong creating the workspace' }
  }
}

export const joinWorkspaceByCode = async (code: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const normalized = code.trim().toUpperCase()
    if (!normalized) return { status: 400, data: 'Join code is required' }

    const workspace = await client.workSpace.findUnique({
      where: { inviteCode: normalized },
      select: { id: true, name: true, userId: true },
    })

    if (!workspace) {
      return { status: 404, data: 'Invalid join code' }
    }

    if (workspace.userId === dbUser.id) {
      return { status: 200, data: { id: workspace.id, name: workspace.name } }
    }

    const existingMember = await client.member.findFirst({
      where: { userId: dbUser.id, workSpaceId: workspace.id },
      select: { id: true },
    })

    if (!existingMember) {
      await client.member.create({
        data: {
          userId: dbUser.id,
          workSpaceId: workspace.id,
        },
      })

      const memberName =
        `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
      await logActivity({
        workspaceId: workspace.id,
        type: 'WORKSPACE_JOINED',
        content: 'joined the workspace',
        userId: dbUser.id,
      })
      await notifyWorkspaceMembers({
        workspaceId: workspace.id,
        actorId: dbUser.id,
        type: 'WORKSPACE_JOINED',
        content: `${memberName} joined ${workspace.name}`,
        link: `/dashboard/${workspace.id}/workspace`,
      })
    }

    return { status: 200, data: { id: workspace.id, name: workspace.name } }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong joining the workspace' }
  }
}

export const getJoinedWorkspaces = async () => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: [] }

    const workspaces = await client.workSpace.findMany({
      where: {
        type: 'PUBLIC',
        OR: [
          { userId: dbUser.id },
          { members: { some: { userId: dbUser.id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        userId: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            videos: true,
            sharedVideos: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = workspaces.map((ws) => {
      const activityDates = [
        ws.messages[0]?.createdAt,
        ws.videos[0]?.createdAt,
        ws.createdAt,
      ].filter(Boolean) as Date[]
      const lastActivity = activityDates.sort(
        (a, b) => b.getTime() - a.getTime()
      )[0]
      return {
        id: ws.id,
        name: ws.name,
        inviteCode: ws.inviteCode,
        isOwner: ws.userId === dbUser.id,
        memberCount: Math.max(ws._count.members, ws.userId ? 1 : 0),
        videoCount: ws._count.videos + ws._count.sharedVideos,
        lastActivity,
      }
    })

    return { status: 200, data }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

export const getWorkspaceDetails = async (workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: null }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: null }

    const workspace = await client.workSpace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        type: true,
        inviteCode: true,
        userId: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    })

    if (!workspace) return { status: 404, data: null }

    return {
      status: 200,
      data: {
        ...workspace,
        isOwner: workspace.userId === dbUser.id,
      },
    }
  } catch (error) {
    console.log(error)
    return { status: 500, data: null }
  }
}

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 403, data: [] }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: [] }

    const workspace = await client.workSpace.findUnique({
      where: { id: workspaceId },
      select: {
        userId: true,
        User: {
          select: { id: true, firstname: true, lastname: true, image: true, email: true },
        },
        members: {
          select: {
            id: true,
            createdAt: true,
            User: {
              select: { id: true, firstname: true, lastname: true, image: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!workspace) return { status: 404, data: [] }

    const seen = new Set<string>()
    const members: {
      id: string
      firstname: string | null
      lastname: string | null
      image: string | null
      email: string
      isOwner: boolean
      joinedAt: Date | null
    }[] = []

    if (workspace.User) {
      seen.add(workspace.User.id)
      members.push({
        id: workspace.User.id,
        firstname: workspace.User.firstname,
        lastname: workspace.User.lastname,
        image: workspace.User.image,
        email: workspace.User.email,
        isOwner: true,
        joinedAt: null,
      })
    }

    for (const m of workspace.members) {
      if (!m.User || seen.has(m.User.id)) continue
      seen.add(m.User.id)
      members.push({
        id: m.User.id,
        firstname: m.User.firstname,
        lastname: m.User.lastname,
        image: m.User.image,
        email: m.User.email,
        isOwner: false,
        joinedAt: m.createdAt,
      })
    }

    return { status: 200, data: members }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

type WorkspaceVideoItem = {
  id: string
  title: string | null
  source: string
  processing: boolean
  createdAt: Date
  Folder: { id: string; name: string } | null
  User: { firstname: string | null; lastname: string | null; image: string | null } | null
  sharedAt: Date
  pinned: boolean
  reviewStatus: 'PENDING' | 'NEEDS_CHANGES' | 'APPROVED'
  reviewNote: string | null
}

export const getWorkspaceSharedVideos = async (workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 403, data: [] }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: [] }

    const [owned, shared] = await Promise.all([
      client.video.findMany({
        where: { workSpaceId: workspaceId },
        select: {
          id: true,
          title: true,
          source: true,
          processing: true,
          createdAt: true,
          Folder: { select: { id: true, name: true } },
          User: { select: { firstname: true, lastname: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      client.sharedVideo.findMany({
        where: { workSpaceId: workspaceId },
        select: {
          createdAt: true,
          pinned: true,
          reviewStatus: true,
          reviewNote: true,
          Video: {
            select: {
              id: true,
              title: true,
              source: true,
              processing: true,
              createdAt: true,
              Folder: { select: { id: true, name: true } },
              User: { select: { firstname: true, lastname: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const map = new Map<string, WorkspaceVideoItem>()
    for (const v of owned) {
      map.set(v.id, {
        ...v,
        sharedAt: v.createdAt,
        pinned: false,
        reviewStatus: 'PENDING',
        reviewNote: null,
      })
    }
    for (const s of shared) {
      if (!s.Video) continue
      const existing = map.get(s.Video.id)
      if (existing) {
        existing.pinned = s.pinned
        existing.reviewStatus = s.reviewStatus
        existing.reviewNote = s.reviewNote
      } else {
        map.set(s.Video.id, {
          ...s.Video,
          sharedAt: s.createdAt,
          pinned: s.pinned,
          reviewStatus: s.reviewStatus,
          reviewNote: s.reviewNote,
        })
      }
    }

    const data = Array.from(map.values()).sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.sharedAt.getTime() - a.sharedAt.getTime()
    })

    return { status: data.length > 0 ? 200 : 404, data }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

export const getWorkspaceOverview = async (workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 403, data: null }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: null }

    const [videoCount, sharedCount, memberCount, latestVideosResult, members] =
      await Promise.all([
        client.video.count({ where: { workSpaceId: workspaceId } }),
        client.sharedVideo.count({ where: { workSpaceId: workspaceId } }),
        client.member.count({ where: { workSpaceId: workspaceId } }),
        getWorkspaceSharedVideos(workspaceId),
        getWorkspaceMembers(workspaceId),
      ])

    const latestVideos = latestVideosResult.data.slice(0, 4)
    const memberList = members.data

    const recentActivity = latestVideosResult.data.slice(0, 5).map((v) => ({
      id: v.id,
      type: 'video' as const,
      title: v.title ?? 'Untitled Video',
      author: `${v.User?.firstname ?? ''} ${v.User?.lastname ?? ''}`.trim() || 'Someone',
      createdAt: v.sharedAt,
    }))

    return {
      status: 200,
      data: {
        totalVideos: videoCount + sharedCount,
        memberCount: memberList.length || memberCount,
        latestVideos,
        recentActivity,
        members: memberList.slice(0, 6),
      },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      data: {
        totalVideos: 0,
        memberCount: 0,
        latestVideos: [],
        recentActivity: [],
        members: [],
      },
    }
  }
}

export const shareVideoToWorkspace = async (
  videoId: string,
  workspaceId: string
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const workspace = await client.workSpace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { userId: dbUser.id },
          { members: { some: { userId: dbUser.id } } },
        ],
      },
      select: { id: true },
    })

    if (!workspace) {
      return { status: 403, data: 'You are not a member of this workspace' }
    }

    const existingShare = await client.sharedVideo.findUnique({
      where: { videoId_workSpaceId: { videoId, workSpaceId: workspaceId } },
      select: { id: true },
    })

    await client.sharedVideo.upsert({
      where: {
        videoId_workSpaceId: { videoId, workSpaceId: workspaceId },
      },
      update: {},
      create: {
        videoId,
        workSpaceId: workspaceId,
        sharedById: dbUser.id,
      },
    })

    if (!existingShare) {
      const [video, ws] = await Promise.all([
        client.video.findUnique({
          where: { id: videoId },
          select: { title: true },
        }),
        client.workSpace.findUnique({
          where: { id: workspaceId },
          select: { name: true },
        }),
      ])
      const sharerName =
        `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
      await logActivity({
        workspaceId,
        type: 'VIDEO_SHARED',
        content: `shared ${video?.title ?? 'a video'}`,
        userId: dbUser.id,
        videoId,
      })
      await notifyWorkspaceMembers({
        workspaceId,
        actorId: dbUser.id,
        type: 'VIDEO_SHARED',
        content: `${sharerName} shared ${video?.title ?? 'a video'} in ${
          ws?.name ?? 'the workspace'
        }`,
        link: `/dashboard/${workspaceId}/video/${videoId}`,
      })
    }

    return { status: 200, data: 'Video shared to workspace' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong sharing the video' }
  }
}

export const getWorkspaceMessages = async (workspaceId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 403, data: [] }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: [] }

    const messages = await client.message.findMany({
      where: { workSpaceId: workspaceId },
      select: {
        id: true,
        content: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentType: true,
        createdAt: true,
        userId: true,
        User: {
          select: { id: true, firstname: true, lastname: true, image: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    return {
      status: 200,
      data: messages.map((m) => ({
        ...m,
        isOwn: dbUser.id === m.userId,
      })),
    }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

export const uploadChatAttachment = async (formData: FormData) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 403, data: null }

    const workspaceId = formData.get('workspaceId') as string
    const file = formData.get('file') as File | null
    if (!workspaceId || !file) return { status: 400, data: null }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: null }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat')
    await mkdir(uploadDir, { recursive: true })
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${Date.now()}-${safeName}`
    await writeFile(path.join(uploadDir, filename), buffer)

    return {
      status: 200,
      data: {
        url: `/uploads/chat/${filename}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
      },
    }
  } catch (error) {
    console.log(error)
    return { status: 500, data: null }
  }
}

export const sendWorkspaceMessage = async (
  workspaceId: string,
  content: string,
  attachment?: {
    url: string
    name: string
    type: string
  } | null
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: 'You are not a member of this workspace' }

    const trimmed = content.trim()
    if (!trimmed && !attachment) return { status: 400, data: 'Message cannot be empty' }

    const message = await client.message.create({
      data: {
        content: trimmed || attachment?.name || 'Attachment',
        userId: dbUser.id,
        workSpaceId: workspaceId,
        attachmentUrl: attachment?.url ?? null,
        attachmentName: attachment?.name ?? null,
        attachmentType: attachment?.type ?? null,
      },
      select: { id: true },
    })

    const mentionedIds = await resolveMentionedUserIds(workspaceId, trimmed)
    if (mentionedIds.length > 0) {
      const senderName =
        `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
      await Promise.all(
        mentionedIds
          .filter((id) => id !== dbUser.id)
          .map((userId) =>
            createNotification({
              userId,
              actorId: dbUser.id,
              type: 'MENTION',
              content: `${senderName} mentioned you in chat`,
              workspaceId,
              link: `/dashboard/${workspaceId}/workspace`,
            })
          )
      )
    }

    return { status: 200, data: message.id }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong sending the message' }
  }
}
