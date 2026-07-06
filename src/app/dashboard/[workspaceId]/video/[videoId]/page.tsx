import { getPreviewVideo } from '@/actions/workspace'
import { getWorkspaceMembers } from '@/actions/collab-workspace'
import { getWorkspaceVideoComments } from '@/actions/video-comments'
import VideoPreview from '@/components/global/videos/preview'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import React from 'react'

type Props = {
  params: {
    videoId: string
    workspaceId: string
  }
}

const VideoPage = async ({ params: { videoId, workspaceId } }: Props) => {
  const query = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 120_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  await query.prefetchQuery({
    queryKey: ['preview-video', videoId],
    queryFn: () => getPreviewVideo(videoId),
  })

  if (workspaceId !== PERSONAL_ROUTE) {
    await Promise.all([
      query.prefetchQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: () => getWorkspaceMembers(workspaceId),
        staleTime: 120_000,
      }),
      query.prefetchQuery({
        queryKey: [`workspace-video-comments-${videoId}`],
        queryFn: () => getWorkspaceVideoComments(videoId),
        staleTime: 60_000,
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
