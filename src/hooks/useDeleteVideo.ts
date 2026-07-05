'use client'

import { deleteVideo } from '@/actions/workspace'
import { useMutationData } from '@/hooks/useMutationData'
import { useQueryClient } from '@tanstack/react-query'

export const useDeleteVideo = () => {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutationData(
    ['delete-video'],
    (data: { id: string }) => deleteVideo(data.id),
    'user-videos',
    () => {
      queryClient.invalidateQueries({ queryKey: ['user-videos'] })
      queryClient.invalidateQueries({ queryKey: ['recent-videos'] })
      queryClient.invalidateQueries({ queryKey: ['workspace-videos'] })
    }
  )

  return { deleteVideo: mutate, isPending }
}
