'use client'

import { getWorkspaceSharedVideos } from '@/actions/collab-workspace'
import VideoCard from '@/components/global/videos/video-card'
import { Empty } from '@/components/icons/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { REVIEW_STATUS } from '@prisma/client'
import React from 'react'

type SharedVideos = {
  status: number
  data: {
    id: string
    title: string | null
    source: string
    processing: boolean
    createdAt: Date
    sharedAt: Date
    pinned: boolean
    reviewStatus: REVIEW_STATUS
    reviewNote: string | null
    Folder: { id: string; name: string } | null
    User: { firstname: string | null; lastname: string | null; image: string | null } | null
  }[]
}

const WorkspaceVideos = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isPending } = useQueryData(
    ['workspace-videos', workspaceId],
    () => getWorkspaceSharedVideos(workspaceId),
    true,
    { staleTime: 120_000, refetchOnMount: false }
  )

  const result = data as SharedVideos

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!result || result.status !== 200 || result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center animate-fade-in">
        <div className="max-w-[260px] opacity-80">
          <Empty />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            No shared videos yet
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Share a video from your library using the Share button on any video
            card to make it appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 animate-fade-in">
      {result.data.map((video) => (
        <VideoCard
          key={video.id}
          workspaceId={workspaceId}
          showWorkspaceControls
          {...video}
        />
      ))}
    </div>
  )
}

export default WorkspaceVideos
