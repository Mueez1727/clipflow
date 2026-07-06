'use client'

import Modal from '../modal'
import ChangeVideoLocation from '@/components/forms/change-video-location'
import CopyLink from './copy-link'
import { useDeleteVideo } from '@/hooks/useDeleteVideo'
import { togglePinVideo } from '@/actions/review'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VIDEO_ACTION_BTN, VIDEO_ACTION_ICON } from '@/lib/video-action-styles'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Move, Pin, Trash2 } from 'lucide-react'
import React, { useTransition } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  workspaceId: string
  pinned?: boolean
  currentFolder?: string
  currentFolderName?: string
}

const WorkspaceVideoActions = ({
  videoId,
  workspaceId,
  pinned = false,
  currentFolder,
  currentFolderName,
}: Props) => {
  const queryClient = useQueryClient()
  const { deleteVideo, isPending } = useDeleteVideo()
  const [pinning, startPin] = useTransition()

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['workspace-videos', workspaceId] })
  }

  const onPin = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startPin(async () => {
      const res = await togglePinVideo(videoId, workspaceId)
      toast(res.status === 200 ? 'Success' : 'Error', { description: res.data })
      if (res.status === 200) refresh()
    })
  }

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      !window.confirm('Delete this video permanently? This cannot be undone.')
    ) {
      return
    }
    deleteVideo({ id: videoId })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={pinned ? 'Unpin video' : 'Pin video'}
              disabled={pinning}
              onClick={onPin}
              className={cn(
                VIDEO_ACTION_BTN,
                pinned && 'border-[#7C3AED]/50 bg-[#7C3AED] text-white hover:bg-[#7C3AED]'
              )}
            >
              <Pin className={VIDEO_ACTION_ICON} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{pinned ? 'Unpin' : 'Pin'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={(e) => e.stopPropagation()}>
              <Modal
                title="Move video"
                description="Move this video to another folder."
                trigger={
                  <button type="button" className={VIDEO_ACTION_BTN} aria-label="Move video">
                    <Move className={VIDEO_ACTION_ICON} />
                  </button>
                }
              >
                <ChangeVideoLocation
                  currentFolder={currentFolder}
                  currentWorkSpace={workspaceId}
                  videoId={videoId}
                  currentFolderName={currentFolderName}
                />
              </Modal>
            </div>
          </TooltipTrigger>
          <TooltipContent>Move</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Delete video"
              disabled={isPending}
              onClick={onDelete}
              className={cn(
                VIDEO_ACTION_BTN,
                'hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
              )}
            >
              <Trash2 className={VIDEO_ACTION_ICON} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Delete Video</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={(e) => e.stopPropagation()}>
              <CopyLink
                videoId={videoId}
                variant="ghost"
                iconOnly
                className={VIDEO_ACTION_BTN}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Copy Link</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default WorkspaceVideoActions
