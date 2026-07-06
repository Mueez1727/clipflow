import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'

type QueryOptions = Pick<
  UseQueryOptions,
  'staleTime' | 'gcTime' | 'refetchOnWindowFocus'
>

export const useQueryData = (
  queryKey: QueryKey,
  queryFn: QueryFunction,
  enabled: boolean = true,
  options?: QueryOptions
) => {
  const { data, isPending, isFetched, refetch, isFetching } = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  })
  return { data, isPending, isFetched, refetch, isFetching }
}