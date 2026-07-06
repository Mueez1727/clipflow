'use client'

import { getWorkSpaces } from '@/actions/workspace'
import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { BrandLogo } from '@/components/website/brand-logo'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import { WorkspaceProps } from '@/types/index.type'
import { Home, Library, Menu, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { WORKSPACES } from '@/redux/slices/workspaces'
import { useQueryData } from '@/hooks/useQueryData'
import InfoBar from '../info-bar'
import SidebarItem from './sidebar-item'
import WorkspaceSection from '../workspace/workspace-section'

type Props = {
  activeWorkspaceId: string
}

const Sidebar = ({ activeWorkspaceId }: Props) => {
  const pathName = usePathname()
  const dispatch = useDispatch()

  const { data, isFetched } = useQueryData(['user-workspaces'], getWorkSpaces, true, {
    staleTime: 60_000,
  })
  const { data: joinedData } = useQueryData(
    ['joined-workspaces'],
    getJoinedWorkspaces,
    true,
    { staleTime: 60_000 }
  )

  const workspacePayload = (data as WorkspaceProps | undefined)?.data ?? {
    workspace: [],
    members: [],
    subscription: null,
  }

  useEffect(() => {
    if (isFetched && workspacePayload.workspace.length) {
      dispatch(WORKSPACES({ workspaces: workspacePayload.workspace }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched])

  const joinedWorkspaces =
    (joinedData as { data: { id: string; isOwner?: boolean }[] } | undefined)
      ?.data ?? []
  const joinedMatch = joinedWorkspaces.find((w) => w.id === activeWorkspaceId)

  const role: 'Owner' | 'Member' = joinedMatch?.isOwner ? 'Owner' : 'Member'

  const personalBase = `/dashboard/${PERSONAL_ROUTE}`
  const isWorkspaceRoute =
    pathName.startsWith('/dashboard/workspace') ||
    (activeWorkspaceId !== PERSONAL_ROUTE &&
      pathName.includes('/workspace'))

  const menuItems = useMemo(
    () => [
      {
        title: 'Home',
        href: `${personalBase}/home`,
        icon: <Home className="h-5 w-5" />,
        active: pathName === `${personalBase}/home`,
      },
      {
        title: 'Library',
        href: personalBase,
        icon: <Library className="h-5 w-5" />,
        active:
          pathName === personalBase || pathName.includes('/folder/'),
      },
      {
        title: 'Workspace',
        href: '/dashboard/workspace',
        icon: <Users className="h-5 w-5" />,
        active: isWorkspaceRoute,
      },
    ],
    [personalBase, pathName, isWorkspaceRoute]
  )

  const searchWorkspaceId =
    activeWorkspaceId === PERSONAL_ROUTE
      ? joinedWorkspaces[0]?.id ?? PERSONAL_ROUTE
      : activeWorkspaceId

  const SidebarSection = (
    <div className="flex h-full w-[250px] flex-none flex-col overflow-y-auto border-r border-border bg-card p-4">
      <div className="mb-4 flex w-full shrink-0 items-center justify-center pt-2">
        <BrandLogo textClassName="text-xl" />
      </div>

      <nav className="mt-3 w-full shrink-0">
        <ul>
          {menuItems.map((item) => (
            <SidebarItem
              href={item.href}
              icon={item.icon}
              selected={item.active}
              title={item.title}
              key={item.title}
            />
          ))}
        </ul>
      </nav>

      <Separator className="my-4 w-4/5 shrink-0" />
      <WorkspaceSection />
    </div>
  )

  return (
    <div className="full">
      <InfoBar workspaceId={searchWorkspaceId} role={role} />
      <div className="fixed left-3 top-3 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-border bg-card"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="h-full w-fit p-0">
            {SidebarSection}
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden h-full md:block">{SidebarSection}</div>
    </div>
  )
}

export default React.memo(Sidebar)
