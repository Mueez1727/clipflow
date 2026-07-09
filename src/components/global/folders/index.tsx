'use client'
import FolderDuotone from '@/components/icons/folder-duotone'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Folder from './folder-info'
import { FoldersProps } from './types'
import { useQueryData } from '@/hooks/useQueryData'
import { getWorkspaceFolders } from '@/actions/workspace'
import { useMutationDataState } from '@/hooks/useMutationData'
import Videos from '../videos'
import { useDispatch } from 'react-redux'
import { FOLDERS } from '@/redux/slices/folders'
import { useEffect } from 'react'

type Props = {
  workspaceId: string
}

const Folders = ({ workspaceId }: Props) => {
  const dispatch = useDispatch()
  //get folders
  const { data, isFetched } = useQueryData(
    ['workspace-folders', workspaceId],
    () => getWorkspaceFolders(workspaceId)
  )

type CreateFolderVariables = {
  name: string
  id: string
}

const { latestVariables } = useMutationDataState(['create-folder']) as {
  latestVariables?: {
    status: string
    variables: CreateFolderVariables
  }
}
  const { status, data: folders } = data as FoldersProps

  // if (isFetched && folders) {
  // }

  useEffect(() => {
    if (isFetched && folders) {
      dispatch(FOLDERS({ folders }))
    }
  }, [dispatch, folders, isFetched])

  return (
    <div
      className="flex flex-col gap-4"
      suppressHydrationWarning
    >
      <div className="flex items-center  justify-between">
        <div className="flex items-center gap-4">
          <FolderDuotone />
          <h2 className="text-xl text-foreground"> Folders</h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground transition-colors hover:text-[#7C3AED]">See all</p>
          <ArrowRight color="#707070" />
        </div>
      </div>
      <div
        className={cn(
          status !== 200 && 'justify-center',
          'flex items-center gap-4 overflow-x-auto w-full py-3 scrollbar-thin'
        )}
      >
        {status !== 200 ? (
          <p className="text-neutral-300">No folders in workspace</p>
        ) : (
          <>
            {latestVariables && latestVariables.status === 'pending' && (
              <Folder
                name={latestVariables.variables.name}
                id={latestVariables.variables.id}
                workspaceId={workspaceId}
                optimistic
              />
            )}
            {folders.map((folder) => (
              <Folder
                name={folder.name}
                count={folder._count.videos}
                id={folder.id}
                workspaceId={workspaceId}
                key={folder.id}
              />
            ))}
          </>
        )}
      </div>
      <Videos
        workspaceId={workspaceId}
        folderId={workspaceId}
        videosKey="user-videos"
      />
    </div>
  )
}

export default Folders
export type { FoldersProps, FolderItem } from './types'