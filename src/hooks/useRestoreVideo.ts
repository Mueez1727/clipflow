import { restoreVideo } from '@/actions/workspace'
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type ArchivedVideosCache = {
  status: number
  data: { id: string }[]
}

export const useRestoreVideo = (
  videosKey: QueryKey = ['archived-videos']
) => {
  const queryClient = useQueryClient()

  const { mutate: restoreVideoMutate, isPending } = useMutation({
    mutationKey: ['restore-video'],
    mutationFn: (payload: { id: string }) => restoreVideo(payload.id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: videosKey })
      const previous = queryClient.getQueryData<ArchivedVideosCache>(videosKey)

      queryClient.setQueryData<ArchivedVideosCache>(videosKey, (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((video) => video.id !== id),
        }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(videosKey, context.previous)
      }
      toast('Error', { description: 'Failed to restore video' })
    },
    onSuccess: (data) => {
      toast(data.status === 200 ? 'Success' : 'Error', {
        description: data.data,
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: videosKey })
      void queryClient.invalidateQueries({ queryKey: ['user-videos'] })
      void queryClient.invalidateQueries({ queryKey: ['folder-videos'] })
    },
  })

  return { restoreVideo: restoreVideoMutate, isPending }
}
