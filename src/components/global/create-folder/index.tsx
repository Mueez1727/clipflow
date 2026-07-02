'use client'
import FolderPlusDuotine from '@/components/icons/folder-plus-duotone'
import { Button } from '@/components/ui/button'
import { useCreateFolders } from '@/hooks/useCreateFolder'
import React from 'react'

type Props = { workspaceId: string }

const CreateFolders = ({ workspaceId }: Props) => {
  const { onCreateNewFolder } = useCreateFolders(workspaceId)
  return (
    <Button
      onClick={onCreateNewFolder}
      className="btn-clipflow-outline flex items-center gap-2 rounded-2xl px-4 py-6"
    >
      <FolderPlusDuotine />
      Create A folder
    </Button>
  )
}

export default CreateFolders