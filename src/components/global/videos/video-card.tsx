'use client'
import React from 'react'
import Loader from '../loader'
import CardMenu from './video-card-menu'
import CopyLink from './copy-link'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dot, Share2, User } from 'lucide-react'

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
}

const VideoCard = (props: Props) => {
  const daysAgo = Math.floor(
    (new Date().getTime() - props.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  )

  return (
    <Loader
      className="clipflow-card flex items-center justify-center"
      state={props.processing}
    >
      <div className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute right-3 top-3 z-50 hidden gap-x-3 group-hover:flex">
          <CardMenu
            currentFolderName={props.Folder?.name}
            videoId={props.id}
            currentWorkspace={props.workspaceId}
            currentFolder={props.Folder?.id}
          />
          <CopyLink
            className="h-5 bg-muted p-[5px] hover:bg-accent"
            videoId={props.id}
          />
        </div>
        <Link
          href={`/dashboard/${props.workspaceId}/video/${props.id}`}
          className="flex h-full flex-col justify-between transition-colors duration-200 hover:bg-muted/50"
        >
          <video
            controls={false}
            preload="metadata"
            className="w-full aspect-video opacity-50 z-20"
          >
            <source
              src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${props.source}#t=1`}
            />
          </video>
          <div className="px-5 py-3 flex flex-col gap-7-2 z-20">
            <h2 className="text-sm font-semibold text-foreground">
              {props.title}
            </h2>
            <div className="mt-4 flex items-center gap-x-2">
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
            <div className="mt-4">
              <span className="flex items-center gap-x-1">
                <Share2 className="text-muted-foreground" size={12} />
                <p className="text-xs capitalize text-muted-foreground">
                  {`${props.User?.firstname}'s Workspace`}
                </p>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </Loader>
  )
}

export default VideoCard