import { archiveFolder } from '@/actions/workspace'
import { useMutationData } from './useMutationData'

export const useArchiveFolder = () => {
  const { mutate, isPending } = useMutationData(
    ['archive-folder'],
    (data: { id: string }) => archiveFolder(data.id),
    'workspace-folders'
  )
  return { archiveFolder: mutate, isPending }
}
