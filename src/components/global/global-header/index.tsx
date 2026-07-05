'use client'

import { WorkSpace } from '.prisma/client'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import { usePathname } from 'next/navigation'
import React from 'react'

type Props = {
  workspace: WorkSpace | { id: string; name: string; type?: string }
}

const PAGE_TITLES: Record<string, string> = {
  home: 'Home',
  workspace: 'Workspace',
  settings: 'Settings',
  billing: 'Billing',
  notifications: 'Notifications',
}

const GlobalHeader = ({ workspace }: Props) => {
  const pathName = usePathname()

  if (pathName.includes('video') || pathName.includes('folder')) {
    return null
  }

  if (pathName.startsWith('/dashboard/workspace')) {
    return (
      <article className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Workspaces
        </h1>
      </article>
    )
  }

  const base =
    workspace.id === PERSONAL_ROUTE
      ? `/dashboard/${PERSONAL_ROUTE}`
      : `/dashboard/${workspace.id}`

  const suffix = pathName.split(base)[1] ?? ''
  const segment = suffix.replace(/^\//, '').split('/')[0]?.split('?')[0] ?? ''

  const title =
    segment === '' || segment === 'home'
      ? segment === 'home'
        ? 'Home'
        : 'My Library'
      : PAGE_TITLES[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1)

  return (
    <article className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
    </article>
  )
}

export default React.memo(GlobalHeader)
