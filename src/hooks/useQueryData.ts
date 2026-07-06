import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'

type QueryOptions = Pick<
  UseQueryOptions,
  | 'staleTime'
  | 'gcTime'
  | 'refetchOnWindowFocus'
  | 'refetchOnMount'
  | 'refetchOnReconnect'
>

export const useQueryData = (
  queryKey: QueryKey,
  queryFn: QueryFunction,
  enabled: boolean = true,
  options?: QueryOptions
) => {
  const { data, isPending, isFetched, refetch, isFetching, isLoading } =
    useQuery({
      queryKey,
      queryFn,
      enabled,
      staleTime: options?.staleTime ?? 60_000,
      gcTime: options?.gcTime ?? 300_000,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      refetchOnMount: options?.refetchOnMount ?? false,
      refetchOnReconnect: options?.refetchOnReconnect ?? false,
    })

  return { data, isPending, isFetched, refetch, isFetching, isLoading }
}
