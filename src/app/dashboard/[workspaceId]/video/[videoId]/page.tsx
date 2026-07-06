import { getPreviewVideo } from '@/actions/workspace'
import { getWorkspaceMembers } from '@/actions/collab-workspace'
import { getWorkspaceVideoComments } from '@/actions/video-comments'
import { Skeleton } from '@/components/ui/skeleton'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import React from 'react'

const VideoPreview = dynamic(
  () => import('@/components/global/videos/preview'),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
  }
)

type Props = {
  params: {
    videoId: string
    workspaceId: string
  }
}

const VideoPage = async ({ params: { videoId, workspaceId } }: Props) => {
  const query = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 },
    },
  })

  await query.prefetchQuery({
    queryKey: ['preview-video'],
    queryFn: () => getPreviewVideo(videoId),
  })

  if (workspaceId !== PERSONAL_ROUTE) {
    await Promise.all([
      query.prefetchQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: () => getWorkspaceMembers(workspaceId),
      }),
      query.prefetchQuery({
        queryKey: [`workspace-video-comments-${videoId}`],
        queryFn: () => getWorkspaceVideoComments(videoId),
      }),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <VideoPreview videoId={videoId} workspaceId={workspaceId} />
    </HydrationBoundary>
  )
}

export default VideoPage
