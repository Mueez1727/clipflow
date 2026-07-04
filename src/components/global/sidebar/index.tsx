'use client'
import { getWorkSpaces } from '@/actions/workspace'
import { BrandLogo } from '@/components/website/brand-logo'
import { Separator } from '@/components/ui/separator'

import { WorkspaceProps } from '@/types/index.type'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { Home, Library, Menu, Users } from 'lucide-react'
import SidebarItem from './sidebar-item'
import { useQueryData } from '@/hooks/useQueryData'
import WorkspaceSection from '../workspace/workspace-section'
import GlobalCard from '../global-card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import InfoBar from '../info-bar'
import { useDispatch } from 'react-redux'
import { WORKSPACES } from '@/redux/slices/workspaces'
import PaymentButton from '../payment-button'
import { getJoinedWorkspaces } from '@/actions/collab-workspace'

type Props = {
  activeWorkspaceId: string
}

const Sidebar = ({ activeWorkspaceId }: Props) => {
  const pathName = usePathname()
  const dispatch = useDispatch()

  const { data, isFetched } = useQueryData(['user-workspaces'], getWorkSpaces)
  const { data: joinedData } = useQueryData(
    ['joined-workspaces'],
    getJoinedWorkspaces
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

  const currentWorkspace = workspacePayload.workspace.find(
    (s) => s.id === activeWorkspaceId
  )
  const joinedWorkspaces =
    (joinedData as { data: { id: string; isOwner?: boolean }[] } | undefined)
      ?.data ?? []
  const joinedMatch = joinedWorkspaces.find((w) => w.id === activeWorkspaceId)

  const role: 'Owner' | 'Member' =
    currentWorkspace || joinedMatch?.isOwner ? 'Owner' : 'Member'

  const base = `/dashboard/${activeWorkspaceId}`
  const isWorkspaceRoute = pathName.startsWith(`${base}/workspace`)

  const menuItems = useMemo(
    () => [
      {
        title: 'Home',
        href: `${base}/home`,
        icon: <Home />,
        active: pathName === `${base}/home`,
      },
      {
        title: 'Library',
        href: base,
        icon: <Library />,
        active: pathName === base || pathName.includes('/folder/'),
      },
      {
        title: 'Workspace',
        href: `${base}/workspace`,
        icon: <Users />,
        active: isWorkspaceRoute,
      },
    ],
    [base, pathName, isWorkspaceRoute]
  )

  const SidebarSection = (
    <div className="bg-card flex h-full w-[250px] flex-none flex-col items-center gap-4 overflow-hidden border-r border-border p-4">
      <div className="mb-2 flex w-full items-center justify-center pt-2">
        <BrandLogo textClassName="text-xl" />
      </div>

      <nav className="w-full">
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

      <Separator className="w-4/5" />
      <WorkspaceSection />
      <Separator className="w-4/5" />

      {workspacePayload.subscription?.plan === 'FREE' && (
        <GlobalCard
          title="Upgrade to Pro"
          description=" Unlock AI features like transcription, AI summary, and more."
          footer={<PaymentButton />}
        />
      )}
    </div>
  )

  return (
    <div className="full">
      <InfoBar workspaceId={activeWorkspaceId} role={role} />
      <div className="fixed my-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild className="ml-2">
            <Button variant="ghost" className="mt-[2px]">
              <Menu />
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

export default Sidebar
