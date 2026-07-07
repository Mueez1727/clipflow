import { archiveVideo, restoreVideo } from '@/actions/workspace'
import { useMutationData } from './useMutationData'
import { useQueryClient } from '@tanstack/react-query'

export const useArchiveVideo = (videosKey: string | string[] = 'user-videos') => {
  const queryClient = useQueryClient()
  const normalizedKey =
    typeof videosKey === 'string' ? [videosKey] : videosKey

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: normalizedKey })
    queryClient.invalidateQueries({ queryKey: ['user-videos'] })
    queryClient.invalidateQueries({ queryKey: ['folder-videos'] })
    queryClient.invalidateQueries({ queryKey: ['archived-videos'] })
    queryClient.invalidateQueries({ queryKey: ['workspace-folders'] })
  }

  const { mutate: archive, isPending: archiving } = useMutationData(
    ['archive-video'],
    (data: { id: string }) => archiveVideo(data.id),
    undefined,
    invalidate
  )
  const { mutate: restore, isPending: restoring } = useMutationData(
    ['restore-video'],
    (data: { id: string }) => restoreVideo(data.id),
    undefined,
    invalidate
  )
  return { archiveVideo: archive, restoreVideo: restore, isPending: archiving || restoring }
}
