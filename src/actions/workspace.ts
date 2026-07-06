'use server'

import { client } from '@/lib/prisma'
import {
  getOrCreatePersonalStorage,
  personalVideoWhere,
} from '@/lib/personal-library'
import {
  getCurrentDbUser,
  notifyWorkspaceMembers,
} from '@/lib/server/workspace-helpers'
import { currentUser } from '@clerk/nextjs/server'
import { sendEmail } from './user'
import { createClient, OAuthStrategy } from '@wix/sdk'
import { items } from '@wix/data'
import axios from 'axios'

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: { workspace: null } }

    if (workspaceId === 'personal') {
      return {
        status: 200,
        data: {
          workspace: {
            id: 'personal',
            name: 'Personal Library',
            type: 'PERSONAL',
          },
        },
      }
    }

    const isUserInWorkspace = await client.workSpace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          {
            User: {
              clerkid: user.id,
            },
          },
          {
            members: {
              some: {
                User: {
                  clerkid: user.id,
                },
              },
            },
          },
        ],
      },
    })

    if (!isUserInWorkspace) {
      return { status: 403, data: { workspace: null } }
    }

    return {
      status: 200,
      data: { workspace: isUserInWorkspace },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 403,
      data: { workspace: null },
    }
  }
}

export const getPersonalStorageId = async () => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: null as string | null }
    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true, firstname: true },
    })
    if (!dbUser) return { status: 404, data: null }
    const storageId = await getOrCreatePersonalStorage(
      dbUser.id,
      dbUser.firstname
    )
    return { status: 200, data: storageId }
  } catch (error) {
    console.log(error)
    return { status: 500, data: null }
  }
}

export const getWorkspaceFolders = async (workSpaceId: string) => {
  try {
    let targetId = workSpaceId
    if (workSpaceId === 'personal') {
      const storage = await getPersonalStorageId()
      if (!storage.data) return { status: 404, data: [] }
      targetId = storage.data
    }

    const isFolders = await client.folder.findMany({
      where: {
        workSpaceId: targetId,
        archived: false,
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    })
    if (isFolders && isFolders.length > 0) {
      return { status: 200, data: isFolders }
    }
    return { status: 404, data: [] }
  } catch (error) {
    console.log(error)
    return { status: 403, data: [] }
  }
}

export const getAllUserVideos = async (workSpaceId: string) => {
  void workSpaceId
  try {
    const user = await currentUser()
    if (!user) return { status: 404 }
    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true },
    })
    if (!dbUser) return { status: 404 }

    const videos = await client.video.findMany({
      where: personalVideoWhere(dbUser.id),
      select: {
        id: true,
        title: true,
        createdAt: true,
        source: true,
        processing: true,
        Folder: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            firstname: true,
            lastname: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (videos && videos.length > 0) {
      return { status: 200, data: videos }
    }

    return { status: 404 }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const getWorkSpaces = async () => {
  try {
    const user = await currentUser()

    if (!user) return { status: 404 }

    const workspaces = await client.user.findUnique({
      where: {
        clerkid: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        members: {
          select: {
            WorkSpace: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    })

    if (workspaces) {
      return { status: 200, data: workspaces }
    }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const createWorkspace = async (name: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 404 }
    const authorized = await client.user.findUnique({
      where: {
        clerkid: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })

    if (authorized?.subscription?.plan === 'PRO') {
      const workspace = await client.user.update({
        where: {
          clerkid: user.id,
        },
        data: {
          workspace: {
            create: {
              name,
              type: 'PUBLIC',
            },
          },
        },
      })
      if (workspace) {
        return { status: 201, data: 'Workspace Created' }
      }
    }
    return {
      status: 401,
      data: 'You are not authorized to create a workspace.',
    }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const renameFolders = async (folderId: string, name: string) => {
  try {
    const folder = await client.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name,
      },
    })
    if (folder) {
      return { status: 200, data: 'Folder Renamed' }
    }
    return { status: 400, data: 'Folder does not exist' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Opps! something went wrong' }
  }
}

export const deleteFolder = async (folderId: string) => {
  try {
    const folder = await client.folder.delete({
      where: {
        id: folderId,
      },
    })
    if (folder) {
      return { status: 200, data: 'Folder Deleted' }
    }
    return { status: 400, data: 'Folder does not exist' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Opps! something went wrong' }
  }
}

export const archiveFolder = async (folderId: string) => {
  try {
    const folder = await client.folder.update({
      where: { id: folderId },
      data: { archived: true },
    })
    if (folder) return { status: 200, data: 'Folder archived' }
    return { status: 400, data: 'Folder does not exist' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}

export const restoreFolder = async (folderId: string) => {
  try {
    const folder = await client.folder.update({
      where: { id: folderId },
      data: { archived: false },
    })
    if (folder) return { status: 200, data: 'Folder restored' }
    return { status: 400, data: 'Folder does not exist' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}

export const archiveVideo = async (videoId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: 'Unauthorized' }

    const video = await client.video.findFirst({
      where: {
        id: videoId,
        User: { clerkid: user.id },
      },
      select: { id: true },
    })
    if (!video) return { status: 404, data: 'Video not found' }

    await client.video.update({
      where: { id: videoId },
      data: { archived: true },
    })
    return { status: 200, data: 'Video archived' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}

export const deleteVideo = async (videoId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: 'Unauthorized' }

    const dbUser = await getCurrentDbUser()

    const video = await client.video.findFirst({
      where: {
        id: videoId,
        User: { clerkid: user.id },
      },
      select: {
        id: true,
        title: true,
        sharedIn: { select: { workSpaceId: true } },
      },
    })
    if (!video) return { status: 404, data: 'Video not found' }

    await client.video.delete({ where: { id: videoId } })

    if (dbUser && video.sharedIn.length > 0) {
      const actorName =
        `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
      await Promise.all(
        video.sharedIn.map((share) =>
          notifyWorkspaceMembers({
            workspaceId: share.workSpaceId,
            actorId: dbUser.id,
            type: 'VIDEO_DELETED',
            content: `${actorName} deleted "${video.title ?? 'a video'}"`,
            link: `/dashboard/${share.workSpaceId}/workspace?tab=videos`,
          })
        )
      )
    }

    return { status: 200, data: 'Video deleted' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}

export const restoreVideo = async (videoId: string) => {
  try {
    const video = await client.video.update({
      where: { id: videoId },
      data: { archived: false },
    })
    if (video) return { status: 200, data: 'Video restored' }
    return { status: 400, data: 'Video does not exist' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}

export const getArchivedFolders = async (workSpaceId: string) => {
  try {
    let targetId = workSpaceId
    if (workSpaceId === 'personal') {
      const storage = await getPersonalStorageId()
      if (!storage.data) return { status: 404, data: [] }
      targetId = storage.data
    }

    const folders = await client.folder.findMany({
      where: { workSpaceId: targetId, archived: true },
      include: {
        _count: { select: { videos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { status: folders.length ? 200 : 404, data: folders }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

export const getArchivedVideos = async (workSpaceId: string) => {
  void workSpaceId
  try {
    const user = await currentUser()
    if (!user) return { status: 404, data: [] }
    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true },
    })
    if (!dbUser) return { status: 404, data: [] }

    const videos = await client.video.findMany({
      where: {
        archived: true,
        userId: dbUser.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        source: true,
        processing: true,
        Folder: { select: { id: true, name: true } },
        User: {
          select: { firstname: true, lastname: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { status: videos.length ? 200 : 404, data: videos }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

const workspaceVideoWhere = (_workSpaceId: string, userId: string) =>
  personalVideoWhere(userId)

const videoListSelect = {
  id: true,
  title: true,
  createdAt: true,
  source: true,
  processing: true,
  Folder: {
    select: {
      id: true,
      name: true,
    },
  },
  User: {
    select: {
      firstname: true,
      lastname: true,
      image: true,
    },
  },
} as const

export const getDashboardStats = async (workSpaceId: string) => {
  try {
    const user = await currentUser()
    if (!user) {
      return {
        status: 400,
        data: {
          totalVideos: 0,
          totalFolders: 0,
          videosProcessed: 0,
          workspaceCount: 0,
          storageUsed: null as string | null,
        },
      }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true, firstname: true },
    })
    if (!dbUser) {
      return {
        status: 400,
        data: {
          totalVideos: 0,
          totalFolders: 0,
          videosProcessed: 0,
          workspaceCount: 0,
          storageUsed: null as string | null,
        },
      }
    }

    const videoWhere = workspaceVideoWhere(workSpaceId, dbUser.id)
    const storageId = await getOrCreatePersonalStorage(
      dbUser.id,
      dbUser.firstname
    )

    const [totalVideos, totalFolders, videosProcessed, workspaceCount] =
      await Promise.all([
        client.video.count({ where: videoWhere }),
        client.folder.count({
          where: { workSpaceId: storageId, archived: false },
        }),
        client.video.count({ where: { ...videoWhere, processing: false } }),
        client.workSpace.count({
          where: {
            type: 'PUBLIC',
            OR: [
              { userId: dbUser.id },
              { members: { some: { userId: dbUser.id } } },
            ],
          },
        }),
      ])

    return {
      status: 200,
      data: {
        totalVideos,
        totalFolders,
        videosProcessed,
        workspaceCount,
        storageUsed: null as string | null,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      data: {
        totalVideos: 0,
        totalFolders: 0,
        videosProcessed: 0,
        workspaceCount: 0,
        storageUsed: null as string | null,
      },
    }
  }
}

export const getRecentVideos = async (workSpaceId: string, limit = 4) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 404, data: [] }

    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true },
    })
    if (!dbUser) return { status: 404, data: [] }

    const videos = await client.video.findMany({
      where: workspaceVideoWhere(workSpaceId, dbUser.id),
      select: videoListSelect,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    if (videos.length > 0) {
      return { status: 200, data: videos }
    }

    return { status: 404, data: [] }
  } catch (error) {
    console.log(error)
    return { status: 400, data: [] }
  }
}

export const createFolder = async (workspaceId: string) => {
  try {
    let targetId = workspaceId
    if (workspaceId === 'personal') {
      const storage = await getPersonalStorageId()
      if (!storage.data) {
        return { status: 400, data: 'Unable to create folder' }
      }
      targetId = storage.data
    }

    const isNewFolder = await client.workSpace.update({
      where: {
        id: targetId,
      },
      data: {
        folders: {
          create: { name: 'Untitled' },
        },
      },
    })
    if (isNewFolder) {
      return { status: 200, data: 'New Folder Created' }
    }
    return {
      status: 400,
      data: 'Unable to create folder',
    }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Ops something went wrong' }
  }
}

export const getFolderInfo = async (folderId: string) => {
  try {
    const folder = await client.folder.findUnique({
      where: {
        id: folderId,
      },
      select: {
        name: true,
        _count: {
          select: {
            videos: true,
          },
        },
      },
    })
    if (folder)
      return {
        status: 200,
        data: folder,
      }
    return {
      status: 400,
      data: null,
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      data: null,
    }
  }
}

export const moveVideoLocation = async (
  videoId: string,
  workSpaceId: string,
  folderId: string
) => {
  try {
    const dbUser = await getCurrentDbUser()

    const existing = await client.video.findUnique({
      where: { id: videoId },
      select: {
        title: true,
        sharedIn: { select: { workSpaceId: true } },
        Folder: { select: { name: true } },
      },
    })

    const location = await client.video.update({
      where: {
        id: videoId,
      },
      data: {
        folderId: folderId || null,
        workSpaceId,
      },
    })

    if (location && dbUser && existing) {
      const folder = await client.folder.findUnique({
        where: { id: folderId },
        select: { name: true },
      })
      const actorName =
        `${dbUser.firstname ?? ''} ${dbUser.lastname ?? ''}`.trim() || 'Someone'
      const destination = folder?.name ?? 'library'
      const workspaces = new Set(
        existing.sharedIn.map((s) => s.workSpaceId)
      )
      await Promise.all(
        Array.from(workspaces).map((wsId) =>
          notifyWorkspaceMembers({
            workspaceId: wsId,
            actorId: dbUser.id,
            type: 'VIDEO_MOVED',
            content: `${actorName} moved "${existing.title ?? 'a video'}" to ${destination}`,
            link: `/dashboard/${wsId}/workspace?tab=videos`,
          })
        )
      )
      return { status: 200, data: 'folder changed successfully' }
    }

    if (location) return { status: 200, data: 'folder changed successfully' }
    return { status: 404, data: 'workspace/folder not found' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Oops! something went wrong' }
  }
}

export const getPreviewVideo = async (videoId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 404 }
    const video = await client.video.findUnique({
      where: {
        id: videoId,
      },
      select: {
        title: true,
        createdAt: true,
        source: true,
        description: true,
        processing: true,
        views: true,
        summary: true,
        User: {
          select: {
            firstname: true,
            lastname: true,
            image: true,
            clerkid: true,
            trial: true,
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    })
    console.log("VIDEO FROM DATABASE:", video)
    if (video) {
      return {
        status: 200,
        data: video,
        author: user.id === video.User?.clerkid ? true : false,
      }
    }
    return { status: 404 }
  } catch (error) {
    console.error("GET PREVIEW VIDEO ERROR:", error)
    return { status: 400 }
  }
}

export const sendEmailForFirstView = async (videoId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 404 }
    const firstViewSettings = await client.user.findUnique({
      where: { clerkid: user.id },
      select: {
        firstView: true,
      },
    })
    if (!firstViewSettings?.firstView) return

    const video = await client.video.findUnique({
      where: {
        id: videoId,
      },
      select: {
        title: true,
        views: true,
        User: {
          select: {
            email: true,
          },
        },
      },
    })
    if (video && video.views === 0) {
      await client.video.update({
        where: {
          id: videoId,
        },
        data: {
          views: video.views + 1,
        },
      })

      if (!video.User?.email) {
        return { status: 404 }
      }

      const { transporter, mailOptions } = await sendEmail(
        video.User.email,
        'You got a viewer',
        `Your video ${video.title} just got its first viewer`
      )

      transporter.sendMail(mailOptions, async (error) => {
        if (error) {
          console.log(error.message)
        } else {
          const notification = await client.user.update({
            where: { clerkid: user.id },
            data: {
              notification: {
                create: {
                  content: mailOptions.text,
                },
              },
            },
          })
          if (notification) {
            return { status: 200 }
          }
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export const editVideoInfo = async (
  videoId: string,
  title: string,
  description: string
) => {
  try {
    const video = await client.video.update({
      where: { id: videoId },
      data: {
        title: title.trim() || null,
        description: description.trim() || null,
      },
    })
    if (video) return { status: 200, data: 'Video successfully updated' }
    return { status: 404, data: 'Video not found' }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const getWixContent = async () => {
  try {
    const myWixClient = createClient({
      modules: { items },
      auth: OAuthStrategy({
        clientId: process.env.WIX_OAUTH_KEY as string,
      }),
    })

    const videos = await myWixClient.items
      .query('opal-videos')
      .find()

    const videoIds = videos.items
    .map((v)=> v.data?.title)
    .filter((id): id is string => Boolean(id))

    const video = await client.video.findMany({
      where: {
        id: {
          in: videoIds,
        },
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        source: true,
        processing: true,
        workSpaceId: true,
        User: {
          select: {
            firstname: true,
            lastname: true,
            image: true,
          },
        },
        Folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (video && video.length > 0) {
      return { status: 200, data: video }
    }
    return { status: 404 }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const howToPost = async () => {
  try {
    const response = await axios.get(process.env.CLOUD_WAYS_POST as string)
    if (response.data) {
      return {
        title: response.data[0].title.rendered,
        content: response.data[0].content.rendered,
      }
    }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const generateVideoTranscript = async (
  videoId: string,
  frameDataUrl: string
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: 'Unauthorized' }

    const apiKey = process.env.OPEN_AI_KEY
    if (!apiKey) {
      return { status: 503, data: 'AI service is not configured' }
    }

    if (!frameDataUrl?.startsWith('data:image/')) {
      return { status: 400, data: 'Invalid frame image' }
    }

    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { summary: true },
    })
    if (!video) return { status: 404, data: 'Video not found' }

    const visionRes = await fetch(
      'https://api.z.ai/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4v-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe everything visible in this frame in detail.',
                },
                {
                  type: 'image_url',
                  image_url: { url: frameDataUrl },
                },
              ],
            },
          ],
        }),
      }
    )

    if (!visionRes.ok) {
      console.log('Vision API error', await visionRes.text())
      return { status: 500, data: 'Transcript generation failed' }
    }

    const payload = (await visionRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = payload.choices?.[0]?.message?.content?.trim()
    if (!text) return { status: 500, data: 'Empty transcript returned' }

    await client.video.update({
      where: { id: videoId },
      data: { summary: text },
    })

    return { status: 200, data: text }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Something went wrong' }
  }
}