'use client'

import Modal from '../modal'
import ChangeVideoLocation from '@/components/forms/change-video-location'
import { useArchiveVideo } from '@/hooks/useArchiveVideo'
import { Archive, Move } from 'lucide-react'
import React from 'react'

type Props = {
  videoId: string
  currentWorkspace?: string
  currentFolder?: string
  currentFolderName?: string
}

const CardMenu = ({
  videoId,
  currentFolder,
  currentFolderName,
  currentWorkspace,
}: Props) => {
  const { archiveVideo } = useArchiveVideo()

  return (
    <div className="flex items-center gap-x-2">
      <button
        type="button"
        aria-label="Archive video"
        title="Archive video"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          archiveVideo({ id: videoId })
        }}
        className="text-muted-foreground transition-colors hover:text-[#7C3AED]"
      >
        <Archive size={20} />
      </button>
      <Modal
        className="flex cursor-pointer items-center gap-x-2"
        title="Move to new Workspace/Folder"
        description="Move this video to another workspace or folder."
        trigger={
          <Move
            size={20}
            fill="#4f4f4f"
            className="text-muted-foreground transition-colors hover:text-[#7C3AED]"
          />
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
  )
}

export default CardMenu
