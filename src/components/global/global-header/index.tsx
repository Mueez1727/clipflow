'use client'

import { WorkSpace } from '.prisma/client'
import { usePathname } from 'next/navigation'
import React from 'react'

type Props = {
  workspace: WorkSpace
}

const PAGE_TITLES: Record<string, string> = {
  home: 'Home',
  workspace: 'Workspace',
  settings: 'Settings',
  billing: 'Billing',
  notifications: 'Notifications',
}

const GlobalHeader = ({ workspace }: Props) => {
  const pathName = usePathname().split(`/dashboard/${workspace.id}`)[1] ?? ''

  const segment = pathName.replace(/^\//, '').split('/')[0]?.split('?')[0] ?? ''

  if (pathName.includes('video') || pathName.includes('folder')) {
    return null
  }

  const title =
    segment === '' || segment === 'home'
      ? segment === 'home'
        ? 'Home'
        : 'My Library'
      : PAGE_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)

  return (
    <article className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
    </article>
  )
}

export default React.memo(GlobalHeader)
