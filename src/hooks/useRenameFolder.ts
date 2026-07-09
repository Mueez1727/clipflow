'use client'

import { renameFolders } from '@/actions/workspace'
import { FoldersProps } from '@/components/global/folders/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRenameFolder = (
  workspaceId: string,
  onComplete?: () => void
) => {
  const queryClient = useQueryClient()
  const foldersKey = ['workspace-folders', workspaceId] as const

  const { mutate, isPending } = useMutation({
    mutationKey: ['rename-folders'],
    mutationFn: (data: { id: string; name: string }) =>
      renameFolders(data.id, data.name),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = queryClient.getQueryData<FoldersProps>(foldersKey)

      queryClient.setQueryData<FoldersProps>(foldersKey, (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((folder) =>
            folder.id === id ? { ...folder, name } : folder
          ),
        }
      })

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(foldersKey, context.previous)
      }
      toast.error('Error', { description: 'Failed to rename folder' })
    },
    onSuccess: (data) => {
      toast(data.status === 200 ? 'Success' : 'Error', {
        description: data.data,
      })
      onComplete?.()
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: foldersKey })
    },
  })

  return { renameFolder: mutate, isPending }
}
