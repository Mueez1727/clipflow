'use client'

import { deleteVideo } from '@/actions/workspace'
import { useMutationData } from '@/hooks/useMutationData'
import { useQueryClient } from '@tanstack/react-query'

export const useDeleteVideo = () => {
  const queryClient = useQueryClient()

  const invalidateVideoQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['user-videos'] })
    queryClient.invalidateQueries({ queryKey: ['folder-videos'] })
    queryClient.invalidateQueries({ queryKey: ['recent-videos'] })
    queryClient.invalidateQueries({ queryKey: ['workspace-videos'] })
    queryClient.invalidateQueries({ queryKey: ['workspace-folders'] })
    queryClient.invalidateQueries({ queryKey: ['archived-videos'] })
  }

  const { mutate, isPending } = useMutationData(
    ['delete-video'],
    (data: { id: string }) => deleteVideo(data.id),
    undefined,
    invalidateVideoQueries
  )

  return { deleteVideo: mutate, isPending }
}
