import { z } from 'zod'

export const editVideoInfoSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(5000),
})
