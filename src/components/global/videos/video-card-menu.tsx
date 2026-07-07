'use client'

import Modal from '../modal'
import ChangeVideoLocation from '@/components/forms/change-video-location'
import { useArchiveVideo } from '@/hooks/useArchiveVideo'
import { useDeleteVideo } from '@/hooks/useDeleteVideo'
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
import { Archive, Move, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  currentWorkspace?: string
  currentFolder?: string
  currentFolderName?: string
  showDelete?: boolean
  showArchive?: boolean
}

const CardMenu = ({
  videoId,
  currentFolder,
  currentFolderName,
  currentWorkspace,
  showDelete = true,
  showArchive = true,
}: Props) => {
  const { archiveVideo } = useArchiveVideo()
  const { deleteVideo, isPending } = useDeleteVideo()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
              <div onClick={(e) => e.stopPropagation()}>
                <Modal
                  title="Move to folder"
                  description="Move this video to another folder in your library."
                  trigger={
                    <button
                      type="button"
                      className={VIDEO_ACTION_BTN}
                      aria-label="Move video"
                    >
                      <Move className={VIDEO_ACTION_ICON} />
                    </button>
                  }
                >
                  <ChangeVideoLocation
                    currentFolder={currentFolder}
                    currentWorkSpace={currentWorkspace}
                    videoId={videoId}
                    currentFolderName={currentFolderName}
                  />
                </Modal>
              </div>
            </TooltipTrigger>
            <TooltipContent>Move</TooltipContent>
          </Tooltip>

          {showArchive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Archive video"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    archiveVideo({ id: videoId })
                  }}
                  className={VIDEO_ACTION_BTN}
                >
                  <Archive className={VIDEO_ACTION_ICON} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
          )}

          {showDelete && (
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
          )}
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

export default CardMenu
