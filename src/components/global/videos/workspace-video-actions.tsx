'use client'

import Modal from '../modal'
import ChangeVideoLocation from '@/components/forms/change-video-location'
import CopyLink from './copy-link'
import { useDeleteVideo } from '@/hooks/useDeleteVideo'
import { togglePinVideo } from '@/actions/review'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import React, { useState, useTransition } from 'react'
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

  const onDeleteConfirm = () => {
    deleteVideo({ id: videoId })
    setDeleteDialogOpen(false)
    toast.success('Video deleted')
  }

  return (
    <>
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
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
                  iconOnly
                  className={VIDEO_ACTION_BTN}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Copy Link</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this video. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default WorkspaceVideoActions
