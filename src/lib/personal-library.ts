import { client } from '@/lib/prisma'

export const PERSONAL_ROUTE = 'personal'

export const personalVideoWhere = (userId: string) => ({
  archived: false,
  userId,
})

/** Lazy internal storage for personal folders — not shown as a collab workspace. */
export const getOrCreatePersonalStorage = async (
  userId: string,
  firstname?: string | null
) => {
  const existing = await client.workSpace.findFirst({
    where: { userId, type: 'PERSONAL' },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await client.workSpace.create({
    data: {
      name: `${firstname?.trim() || 'My'} Library`,
      type: 'PERSONAL',
      userId,
    },
    select: { id: true },
  })
  return created.id
}
