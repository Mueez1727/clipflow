'use client'

import { getJoinedWorkspaces, shareVideoToWorkspace } from '@/actions/collab-workspace'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { VIDEO_ACTION_BTN, VIDEO_ACTION_ICON } from '@/lib/video-action-styles'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Share2, Users } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import WorkspaceAvatar from '../workspace/workspace-avatar'
import { WorkspaceCardData } from '../workspace/workspace-card'

type Props = {
  videoId: string
  className?: string
  iconOnly?: boolean
}

const ShareVideo = ({ videoId, className, iconOnly }: Props) => {
  const [open, setOpen] = useState(false)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [sharedIds, setSharedIds] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data, isPending } = useQueryData(
    ['joined-workspaces'],
    getJoinedWorkspaces,
    open
  )

  const workspaces =
    (data as { status: number; data: WorkspaceCardData[] })?.data ?? []

  const onShare = async (workspaceId: string) => {
    setSharingId(workspaceId)
    const result = await shareVideoToWorkspace(videoId, workspaceId)
    setSharingId(null)
    if (result.status === 200) {
      setSharedIds((prev) => [...prev, workspaceId])
      toast('Video shared to workspace')
      queryClient.invalidateQueries({
        queryKey: ['workspace-videos', workspaceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['workspace-overview', workspaceId],
      })
    } else {
      toast(typeof result.data === 'string' ? result.data : 'Unable to share')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button
            type="button"
            aria-label="Share video"
            onClick={(e) => e.stopPropagation()}
            className={cn(VIDEO_ACTION_BTN, className)}
          >
            <Share2 className={VIDEO_ACTION_ICON} />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-5 bg-muted p-[5px] hover:bg-accent',
              className
            )}
            aria-label="Share video"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-[#7C3AED]" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Share to workspace</DialogTitle>
          <DialogDescription>
            Select a workspace to share this video with its members.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[320px] space-y-2 overflow-y-auto py-2">
          {isPending ? (
            <>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </>
          ) : workspaces.length > 0 ? (
            workspaces.map((ws) => {
              const isShared = sharedIds.includes(ws.id)
              return (
                <button
                  key={ws.id}
                  type="button"
                  disabled={sharingId === ws.id || isShared}
                  onClick={() => onShare(ws.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all duration-200 hover:border-[#7C3AED]/40 hover:shadow-sm disabled:opacity-70"
                >
                  <WorkspaceAvatar name={ws.name} className="h-10 w-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {ws.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {ws.memberCount} members
                    </p>
                  </div>
                  {sharingId === ws.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isShared ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                      <Check className="h-4 w-4" />
                      Shared
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#7C3AED]">
                      Share
                    </span>
                  )}
                </button>
              )
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You have no collaborative workspaces yet. Create or join one first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareVideo
