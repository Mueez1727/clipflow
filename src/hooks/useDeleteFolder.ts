import { deleteFolder } from '@/actions/workspace'
import { useMutationData } from './useMutationData'

export const useDeleteFolder = () => {
  const { mutate, isPending } = useMutationData(
    ['delete-folder'],
    (data: { id: string }) => deleteFolder(data.id),
    'workspace-folders'
  )

  return { deleteFolder: mutate, isPending }
}
