'use client'

import Modal from '../modal'
import ChangeVideoLocation from '@/components/forms/change-video-location'
import { useArchiveVideo } from '@/hooks/useArchiveVideo'
import { useDeleteVideo } from '@/hooks/useDeleteVideo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Archive, Move, Trash2 } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  currentWorkspace?: string
  currentFolder?: string
  currentFolderName?: string
  showDelete?: boolean
}

const actionBtn =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-sm transition-colors hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] dark:bg-card/95 dark:hover:bg-[#7C3AED]/20'

const CardMenu = ({
  videoId,
  currentFolder,
  currentFolderName,
  currentWorkspace,
  showDelete = true,
}: Props) => {
  const { archiveVideo } = useArchiveVideo()
  const { deleteVideo, isPending } = useDeleteVideo()

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      !window.confirm('Delete this video permanently? This cannot be undone.')
    ) {
      return
    }
    deleteVideo({ id: videoId })
    toast.success('Video deleted')
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={(e) => e.stopPropagation()}>
              <Modal
                className={actionBtn}
                title="Move to folder"
                description="Move this video to another folder in your library."
                trigger={<Move className="h-4 w-4" />}
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
              className={actionBtn}
            >
              <Archive className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>

        {showDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Delete video"
                disabled={isPending}
                onClick={onDelete}
                className={`${actionBtn} hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete Video</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export default CardMenu
