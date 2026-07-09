'use client'

import {
  getArchivedFolders,
  getArchivedVideos,
} from '@/actions/workspace'
import VideoCard from '@/components/global/videos/video-card'
import { Button } from '@/components/ui/button'
import { useRestoreVideo } from '@/hooks/useRestoreVideo'
import { useRestoreFolder } from '@/hooks/useRestoreFolder'
import { useQueryData } from '@/hooks/useQueryData'
import { ArchiveRestore, FolderOpen } from 'lucide-react'
import React from 'react'

type Props = {
  workspaceId: string
}

const ArchivedLibrary = ({ workspaceId }: Props) => {
  const { data: foldersData } = useQueryData(
    ['archived-folders', workspaceId],
    () => getArchivedFolders(workspaceId)
  )
  const { data: videosData } = useQueryData(
    ['archived-videos', workspaceId],
    () => getArchivedVideos(workspaceId)
  )

  const folders =
    (foldersData as { data: { id: string; name: string; _count: { videos: number }; createdAt: Date; workSpaceId: string | null }[] })
      ?.data ?? []
  const videos =
    (videosData as {
      data: {
        id: string
        title: string | null
        createdAt: Date
        source: string
        processing: boolean
        Folder: { id: string; name: string } | null
        User: {
          firstname: string | null
          lastname: string | null
          image: string | null
        } | null
      }[]
    })?.data ?? []

  const { restoreFolder, isPending: restoringFolder } =
    useRestoreFolder(workspaceId)

  const { restoreVideo, isPending: restoring } = useRestoreVideo([
    'archived-videos',
    workspaceId,
  ])

  if (!folders.length && !videos.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No archived folders or videos.
      </p>
    )
  }

  return (
    <div className="space-y-10">
      {folders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Archived Folders</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FolderOpen className="h-8 w-8 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{folder.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {folder._count.videos} videos
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={restoringFolder}
                  className="shrink-0 gap-1 text-xs"
                  onClick={() => restoreFolder({ folder })}
                >
                  <ArchiveRestore className="h-3 w-3" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Archived Videos</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {videos.map((video) => (
              <div key={video.id} className="relative">
                <VideoCard workspaceId={workspaceId} archived {...video} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={restoring}
                  className="absolute bottom-3 right-3 z-10 gap-1 text-xs"
                  onClick={() => restoreVideo({ id: video.id })}
                >
                  <ArchiveRestore className="h-3 w-3" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchivedLibrary
