'use client'
import { getPreviewVideo, sendEmailForFirstView } from '@/actions/workspace'
import { useQueryData } from '@/hooks/useQueryData'
import { isDefaultVideoTitle } from '@/lib/video-metadata'
import { VideoProps } from '@/types/index.type'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import EditVideo from '../edit'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import VideoPreviewSidebar from './sidebar'
import { PERSONAL_ROUTE } from '@/lib/personal-library'

const VideoComments = dynamic(
  () => import('../../workspace/video-comments'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
  }
)

const VideoTags = dynamic(() => import('../video-tags'), {
  ssr: false,
  loading: () => <Skeleton className="h-16 w-full rounded-xl" />,
})

type Props = {
  videoId: string
  workspaceId?: string
}

const VideoPreview = ({ videoId, workspaceId }: Props) => {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const { data, isPending } = useQueryData(
    ['preview-video'],
    () => getPreviewVideo(videoId),
    true,
    { staleTime: 60_000 }
  )

  const result = data as VideoProps | undefined
  const video = result?.data
  const status = result?.status
  const author = result?.author

  useEffect(() => {
    if (status && status !== 200) {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (!video || video.views !== 0) return
    void sendEmailForFirstView(videoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.views, videoId])

  if (isPending || !data || !video) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }

  const daysAgo = Math.floor(
    (new Date().getTime() - video.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  )

  const displayTitle =
    video.title && !isDefaultVideoTitle(video.title) ? video.title : null
  const displayDescription =
    video.description &&
    video.description !== 'No Description' &&
    video.description.trim()
      ? video.description
      : null

  const commentsWorkspaceId =
    workspaceId && workspaceId !== PERSONAL_ROUTE ? workspaceId : undefined

  return (
    <div className="grid grid-cols-1 gap-5 overflow-y-auto lg:grid-cols-3 lg:py-10">
      <div className="flex flex-col gap-y-10 lg:col-span-2">
        <div>
          <div className="flex items-start justify-between gap-x-5">
            {displayTitle ? (
              <h2 className="text-4xl font-bold text-foreground">{displayTitle}</h2>
            ) : (
              <h2 className="text-4xl font-bold text-muted-foreground/50">
                Add a title…
              </h2>
            )}
            {author ? (
              <EditVideo
                videoId={videoId}
                title={video.title as string}
                description={video.description as string}
              />
            ) : null}
          </div>
          <span className="mt-2 flex gap-x-3">
            <p className="capitalize text-muted-foreground">
              {video.User?.firstname} {video.User?.lastname}
            </p>
            <p className="text-muted-foreground">
              {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
            </p>
          </span>
        </div>
        <video
          ref={videoRef}
          preload="metadata"
          className="aspect-video w-full rounded-xl"
          controls
        >
          <source
            src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${video.source}#1`}
          />
        </video>
        <VideoTags
          videoId={videoId}
          tags={video.tags ?? []}
          editable={Boolean(author)}
        />
        <div className="flex flex-col gap-y-4 text-2xl">
          <div className="flex items-center justify-between gap-x-5">
            <p className="text-semibold text-foreground">Description</p>
            {author ? (
              <EditVideo
                videoId={videoId}
                title={video.title as string}
                description={video.description as string}
              />
            ) : null}
          </div>
          {displayDescription ? (
            <p className="text-lg font-medium text-muted-foreground">
              {displayDescription}
            </p>
          ) : (
            <p className="text-lg font-medium text-muted-foreground/40">
              Add a description…
            </p>
          )}
        </div>
        {commentsWorkspaceId && (
          <VideoComments
            videoId={videoId}
            workspaceId={commentsWorkspaceId}
            videoRef={videoRef}
          />
        )}
      </div>
      <VideoPreviewSidebar videoId={videoId} source={video.source} />
    </div>
  )
}

export default React.memo(VideoPreview)
