import { archiveVideo, restoreVideo } from '@/actions/workspace'
import { useMutationData } from './useMutationData'

export const useArchiveVideo = (videosKey = 'user-videos') => {
  const { mutate: archive, isPending: archiving } = useMutationData(
    ['archive-video'],
    (data: { id: string }) => archiveVideo(data.id),
    videosKey
  )
  const { mutate: restore, isPending: restoring } = useMutationData(
    ['restore-video'],
    (data: { id: string }) => restoreVideo(data.id),
    videosKey
  )
  return { archiveVideo: archive, restoreVideo: restore, isPending: archiving || restoring }
}
