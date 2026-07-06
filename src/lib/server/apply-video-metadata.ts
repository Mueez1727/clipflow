import { client } from '@/lib/prisma'
import {
  generateDefaultTitle,
  generateSmartTags,
  isDefaultVideoTitle,
} from '@/lib/video-metadata'

export const applyVideoMetadataOnComplete = async (source: string) => {
  const video = await client.video.findFirst({
    where: { source },
    select: {
      id: true,
      title: true,
      createdAt: true,
      source: true,
      tags: true,
      WorkSpace: { select: { name: true, type: true } },
      Folder: { select: { name: true } },
      sharedIn: { select: { id: true }, take: 1 },
    },
  })

  if (!video) return null

  const context = {
    createdAt: video.createdAt,
    source: video.source,
    workspaceName: video.WorkSpace?.name ?? null,
    workspaceType: video.WorkSpace?.type ?? null,
    folderName: video.Folder?.name ?? null,
    isShared: video.sharedIn.length > 0,
  }

  const data: {
    processing: boolean
    title?: string
    tags: string[]
  } = {
    processing: false,
    tags:
      video.tags.length > 0
        ? video.tags
        : generateSmartTags(context),
  }

  if (isDefaultVideoTitle(video.title)) {
    data.title = generateDefaultTitle(context)
  }

  return client.video.update({
    where: { id: video.id },
    data,
  })
}
