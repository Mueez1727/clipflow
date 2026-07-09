'use client'

import { restoreFolder } from '@/actions/workspace'
import { FoldersProps } from '@/components/global/folders/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type RestorableFolder = {
  id: string
  name: string
  createdAt: Date
  workSpaceId: string | null
  _count: { videos: number }
}

type ArchivedFoldersCache = {
  status: number
  data: RestorableFolder[]
}

export const useRestoreFolder = (workspaceId: string) => {
  const queryClient = useQueryClient()
  const foldersKey = ['workspace-folders', workspaceId] as const
  const archivedKey = ['archived-folders', workspaceId] as const

  const { mutate, isPending } = useMutation({
    mutationKey: ['restore-folder'],
    mutationFn: (payload: { folder: RestorableFolder }) =>
      restoreFolder(payload.folder.id),
    onMutate: async ({ folder }) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      await queryClient.cancelQueries({ queryKey: archivedKey })

      const previousFolders = queryClient.getQueryData<FoldersProps>(foldersKey)
      const previousArchived =
        queryClient.getQueryData<ArchivedFoldersCache>(archivedKey)

      queryClient.setQueryData<ArchivedFoldersCache>(archivedKey, (old) => {
        if (!old?.data) return old
        const next = old.data.filter((item) => item.id !== folder.id)
        return {
          status: next.length ? 200 : 404,
          data: next,
        }
      })

      queryClient.setQueryData<FoldersProps>(foldersKey, (old) => {
        const existing = old?.data ?? []
        if (existing.some((item) => item.id === folder.id)) return old
        const next = [folder, ...existing]
        return {
          status: 200,
          data: next,
        }
      })

      return { previousFolders, previousArchived }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(foldersKey, context.previousFolders)
      }
      if (context?.previousArchived) {
        queryClient.setQueryData(archivedKey, context.previousArchived)
      }
      toast.error('Error', { description: 'Failed to restore folder' })
    },
    onSuccess: (data) => {
      toast(data.status === 200 ? 'Success' : 'Error', {
        description: data.data,
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: foldersKey })
      void queryClient.invalidateQueries({ queryKey: archivedKey })
    },
  })

  return { restoreFolder: mutate, isPending }
}
