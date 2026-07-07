'use client'
import { getPreviewVideo, recordVideoView } from '@/actions/workspace'
import { useQueryData } from '@/hooks/useQueryData'
import { isDefaultVideoTitle } from '@/lib/video-metadata'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import { toDate } from '@/lib/utils'
import { VideoProps } from '@/types/index.type'
import Link from 'next/link'
import React, { useEffect, useMemo, useRef } from 'react'
import EditVideo from '../edit'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import VideoPreviewSidebar from './sidebar'

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
  const videoRef = useRef<HTMLVideoElement>(null)

  const libraryPath = useMemo(
    () =>
      workspaceId && workspaceId !== PERSONAL_ROUTE
        ? `/dashboard/${workspaceId}`
        : `/dashboard/${PERSONAL_ROUTE}`,
    [workspaceId]
  )

  const { data, isPending, isFetched } = useQueryData(
    ['preview-video', videoId],
    () => getPreviewVideo(videoId),
    true,
    { staleTime: 120_000, refetchOnMount: false }
  )

  const result = data as VideoProps | undefined
  const video = result?.data
  const status = result?.status
  const author = result?.author

  useEffect(() => {
    if (!video) return
    const sessionKey = `video-viewed-${videoId}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, '1')
    }
    void recordVideoView(videoId)
  }, [video, videoId])

  const isLoading = isPending && !video

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }

  if (isFetched && status === 401) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Please sign in to view this video.
        </p>
      </div>
    )
  }

  if (isFetched && status === 404) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">This video could not be found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={libraryPath}>Back to library</Link>
        </Button>
      </div>
    )
  }

  if (isFetched && status !== 200) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Unable to load this video right now. Please try again.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={libraryPath}>Back to library</Link>
        </Button>
      </div>
    )
  }

  if (!video) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }

  const createdAt = toDate(video.createdAt)
  const daysAgo = Math.floor(
    (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
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
