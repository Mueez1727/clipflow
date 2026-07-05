'use client'

import { PERSONAL_ROUTE } from '@/lib/personal-library'
import CopyLink from './copy-link'
import ShareVideo from './share-video'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Loader from '../loader'
import CardMenu from './video-card-menu'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dot, Pin, Share2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { REVIEW_STATUS } from '@prisma/client'
import VideoReviewControls from '../workspace/video-review-controls'
import React from 'react'

const REVIEW_BADGE: Record<REVIEW_STATUS, { label: string; className: string }> =
  {
    PENDING: {
      label: 'Pending Review',
      className: 'bg-slate-600/90 text-white dark:bg-slate-500/90',
    },
    NEEDS_CHANGES: {
      label: 'Needs Changes',
      className: 'bg-amber-500/90 text-white',
    },
    APPROVED: {
      label: 'Approved',
      className: 'bg-emerald-500/90 text-white',
    },
  }

const actionWrap =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-sm transition-colors hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] dark:bg-card/95 dark:hover:bg-[#7C3AED]/20'

type Props = {
  User: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
  id: string
  Folder: {
    id: string
    name: string
  } | null
  createdAt: Date
  title: string | null
  source: string
  processing: boolean
  workspaceId: string
  pinned?: boolean
  reviewStatus?: REVIEW_STATUS
  showWorkspaceControls?: boolean
}

const VideoCard = (props: Props) => {
  const daysAgo = Math.floor(
    (new Date().getTime() - props.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  )

  const linkBase =
    props.showWorkspaceControls && props.workspaceId !== PERSONAL_ROUTE
      ? `/dashboard/${props.workspaceId}`
      : `/dashboard/${PERSONAL_ROUTE}`

  return (
    <Loader
      className="clipflow-card flex items-center justify-center"
      state={props.processing}
    >
      <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg dark:hover:border-[#7C3AED]/40">
        {props.showWorkspaceControls && (
          <div className="absolute left-3 top-3 z-50 flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm',
                REVIEW_BADGE[props.reviewStatus ?? 'PENDING'].className
              )}
            >
              {REVIEW_BADGE[props.reviewStatus ?? 'PENDING'].label}
            </span>
            {props.pinned && (
              <span className="flex items-center gap-1 rounded-full bg-[#7C3AED] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                <Pin className="h-2.5 w-2.5" />
                Pinned
              </span>
            )}
          </div>
        )}
        <TooltipProvider delayDuration={200}>
          <div className="absolute right-3 top-3 z-50 hidden items-center gap-1.5 group-hover:flex">
            {props.showWorkspaceControls && (
              <VideoReviewControls
                videoId={props.id}
                workspaceId={props.workspaceId}
                reviewStatus={props.reviewStatus ?? 'PENDING'}
                pinned={props.pinned ?? false}
              />
            )}
            <CardMenu
              currentFolderName={props.Folder?.name}
              videoId={props.id}
              currentWorkspace={props.workspaceId}
              currentFolder={props.Folder?.id}
              showDelete
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={actionWrap} onClick={(e) => e.stopPropagation()}>
                  <ShareVideo
                    videoId={props.id}
                    className="h-auto bg-transparent p-0 hover:bg-transparent"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={actionWrap} onClick={(e) => e.stopPropagation()}>
                  <CopyLink
                    className="h-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
                    videoId={props.id}
                    variant="ghost"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Copy Link</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Link
          href={`${linkBase}/video/${props.id}`}
          className="flex h-full flex-col justify-between transition-colors duration-200 hover:bg-muted/40 dark:hover:bg-muted/20"
        >
          <video
            controls={false}
            preload="metadata"
            className="z-20 aspect-video w-full opacity-60 dark:opacity-50"
          >
            <source
              src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${props.source}#t=1`}
            />
          </video>
          <div className="z-20 flex flex-col gap-2 px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              {props.title && props.title !== 'Untilted Video'
                ? props.title
                : 'Untitled video'}
            </h2>
            <div className="mt-2 flex items-center gap-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={props.User?.image as string} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs capitalize text-muted-foreground">
                  {props.User?.firstname} {props.User?.lastname}
                </p>
                <p className="flex items-center text-xs text-muted-foreground">
                  <Dot /> {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                </p>
              </div>
            </div>
            {!props.showWorkspaceControls && (
              <div className="mt-2">
                <span className="flex items-center gap-x-1">
                  <Share2 className="text-muted-foreground" size={12} />
                  <p className="text-xs text-muted-foreground">Personal Library</p>
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </Loader>
  )
}

export default React.memo(VideoCard)
