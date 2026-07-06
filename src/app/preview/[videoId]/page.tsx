import { getUserProfile, getVideoComments } from '@/actions/user'
import { getPreviewVideo } from '@/actions/workspace'
import VideoPreview from '@/components/global/videos/preview'

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import React from 'react'

type Props = {
  params: {
    videoId: string
  }
}

const VideoPage = async ({ params: { videoId } }: Props) => {
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
  await query.prefetchQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })

  await query.prefetchQuery({
    queryKey: ['video-comments'],
    queryFn: () => getVideoComments(videoId),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="min-h-screen bg-background px-4 py-8 sm:px-10">
        <VideoPreview videoId={videoId} />
      </div>
    </HydrationBoundary>
  )
}

export default VideoPage