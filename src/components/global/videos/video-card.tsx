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
import WorkspaceVideoActions from './workspace-video-actions'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dot, Pin, Share2, User } from 'lucide-react'
import React from 'react'

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
  showWorkspaceControls?: boolean
  archived?: boolean
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
        {props.showWorkspaceControls && props.pinned && (
          <div className="absolute left-3 top-3 z-50">
            <span className="flex items-center gap-1 rounded-full bg-[#7C3AED] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              <Pin className="h-2.5 w-2.5" />
              Pinned
            </span>
          </div>
        )}
        <TooltipProvider delayDuration={200}>
          <div className="absolute right-3 top-3 z-50 hidden items-center gap-1.5 group-hover:flex">
            {props.showWorkspaceControls ? (
              <WorkspaceVideoActions
                videoId={props.id}
                workspaceId={props.workspaceId}
                pinned={props.pinned}
                currentFolder={props.Folder?.id}
                currentFolderName={props.Folder?.name}
              />
            ) : (
              <>
                <CardMenu
                  currentFolderName={props.Folder?.name}
                  videoId={props.id}
                  currentWorkspace={props.workspaceId}
                  currentFolder={props.Folder?.id}
                  showDelete
                  showArchive={!props.archived}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ShareVideo videoId={props.id} iconOnly />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CopyLink videoId={props.id} variant="ghost" iconOnly />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Copy Link</TooltipContent>
                </Tooltip>
              </>
            )}
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
