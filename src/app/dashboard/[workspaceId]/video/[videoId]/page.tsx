import { getUserProfile, getVideoComments } from '@/actions/user'
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
  const query = new QueryClient()

  await query.prefetchQuery({
    queryKey: ['preview-video'],
    queryFn: () => getPreviewVideo(videoId),
  })

  await query.prefetchQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })

  await query.prefetchQuery({
    queryKey: ['video-comments'],
    queryFn: () => getVideoComments(videoId),
  })

  await query.prefetchQuery({
    queryKey: [`workspace-video-comments-${videoId}`],
    queryFn: () => getWorkspaceVideoComments(videoId),
  })

  if (workspaceId !== PERSONAL_ROUTE) {
    await query.prefetchQuery({
      queryKey: ['workspace-members', workspaceId],
      queryFn: () => getWorkspaceMembers(workspaceId),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <VideoPreview videoId={videoId} workspaceId={workspaceId} />
    </HydrationBoundary>
  )
}

export default VideoPage
