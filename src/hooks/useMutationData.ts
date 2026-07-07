import {
  MutationFunction,
  MutationKey,
  QueryKey,
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

export const useMutationData = <TVariables>(
  mutationKey: MutationKey,
  mutationFn: MutationFunction<
  { status: number; data?: string },
    TVariables
  >,
  queryKey?: QueryKey | string,
  onSuccess?: () => void
) => {
  const client = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess(data) {
      if (onSuccess) onSuccess()

      return toast(
        data?.status === 200 || data?.status === 201 ? 'Success' : 'Error',
        {
          description: data?.data,
        }
      )
    },
    onSettled: () => {
      if (!queryKey) return
      const normalizedQueryKey =
        typeof queryKey === 'string' ? [queryKey] : queryKey
      void client.invalidateQueries({
        queryKey: normalizedQueryKey,
      })
    },
  })

  return { mutate, isPending }
}

export const useMutationDataState = (mutationKey: MutationKey) => {
  const data = useMutationState({
    filters: { mutationKey },
    select: (mutation) => {
      return {
        variables: mutation.state.variables,
        status: mutation.state.status,
      }
    },
  })

  const latestVariables = data[data.length - 1]
  return { latestVariables }
}