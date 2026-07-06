import { editVideoInfoSchema } from '@/components/forms/edit-video/schema'
import useZodForm from './useZodForm'
import { useMutationData } from './useMutationData'
import { editVideoInfo } from '@/actions/workspace'
import { useQueryClient } from '@tanstack/react-query'

export const useEditVideo = (
  videoId: string,
  title: string,
  description: string
) => {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutationData(
    ['edit-video'],
    (data: { title: string; description: string }) =>
      editVideoInfo(videoId, data.title, data.description),
    undefined,
    () => {
      void queryClient.invalidateQueries({ queryKey: ['preview-video', videoId] })
    }
  )
  const { errors, onFormSubmit, register } = useZodForm(
    editVideoInfoSchema,
    mutate,
    {
      title,
      description,
    }
  )

  return { onFormSubmit, register, errors, isPending }
}
