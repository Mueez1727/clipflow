'use client'

import { deleteFolder } from '@/actions/workspace'
import { FoldersProps } from '@/components/global/folders/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeleteFolder = (workspaceId: string) => {
  const queryClient = useQueryClient()
  const foldersKey = ['workspace-folders', workspaceId] as const

  const { mutate, isPending } = useMutation({
    mutationKey: ['delete-folder'],
    mutationFn: (data: { id: string }) => deleteFolder(data.id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = queryClient.getQueryData<FoldersProps>(foldersKey)

      queryClient.setQueryData<FoldersProps>(foldersKey, (old) => {
        if (!old?.data) return old
        const next = old.data.filter((folder) => folder.id !== id)
        return {
          status: next.length ? 200 : 404,
          data: next,
        }
      })

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(foldersKey, context.previous)
      }
      toast.error('Error', { description: 'Failed to delete folder' })
    },
    onSuccess: (data) => {
      toast(data.status === 200 ? 'Success' : 'Error', {
        description: data.data,
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: foldersKey })
    },
  })

  return { deleteFolder: mutate, isPending }
}
