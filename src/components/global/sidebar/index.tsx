'use client'
import { getWorkSpaces } from '@/actions/workspace'
import { Separator } from '@/components/ui/separator'

import { WorkspaceProps } from '@/types/index.type'
import { CLIPFLOW_LOGO } from '@/components/website/brand-logo'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import {
  Activity,
  BarChart3,
  Home,
  Library,
  ListTodo,
  Menu,
  Users,
} from 'lucide-react'
import SidebarItem from './sidebar-item'
import { useQueryData } from '@/hooks/useQueryData'
import WorkspaceSection from '../workspace/workspace-section'
import GlobalCard from '../global-card'
import WorkspaceAvatar from '../workspace/workspace-avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import InfoBar from '../info-bar'
import { useDispatch } from 'react-redux'
import { WORKSPACES } from '@/redux/slices/workspaces'
import PaymentButton from '../payment-button'
import { useUser } from '@clerk/nextjs'

type Props = {
  activeWorkspaceId: string
}

const Sidebar = ({ activeWorkspaceId }: Props) => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { user } = useUser()

  const { data, isFetched } = useQueryData(['user-workspaces'], getWorkSpaces)

  const { data: workspace } = data as WorkspaceProps

  useEffect(() => {
    if (isFetched && workspace) {
      dispatch(WORKSPACES({ workspaces: workspace.workspace }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched])

  const currentWorkspace = workspace.workspace.find(
    (s) => s.id === activeWorkspaceId
  )

  const isOwner = Boolean(currentWorkspace)
  const workspaceName =
    currentWorkspace?.name ??
    workspace.members.find((m) => m.WorkSpace?.id === activeWorkspaceId)
      ?.WorkSpace?.name ??
    'Workspace'
  const role = isOwner ? 'Owner' : 'Member'

  const userName = user?.fullName || user?.firstName || 'Your account'

  const tab = searchParams.get('tab')
  const base = `/dashboard/${activeWorkspaceId}`
  const isWorkspaceRoute = pathName === `${base}/workspace`

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
        active: pathName === base,
      },
      {
        title: 'Workspace',
        href: `${base}/workspace`,
        icon: <Users />,
        active: isWorkspaceRoute && (!tab || tab === 'overview'),
      },
      {
        title: 'Tasks',
        href: `${base}/workspace?tab=tasks`,
        icon: <ListTodo />,
        active: isWorkspaceRoute && tab === 'tasks',
      },
      {
        title: 'Analytics',
        href: `${base}/workspace?tab=analytics`,
        icon: <BarChart3 />,
        active: isWorkspaceRoute && tab === 'analytics',
      },
      {
        title: 'Activity',
        href: `${base}/workspace?tab=activity`,
        icon: <Activity />,
        active: isWorkspaceRoute && tab === 'activity',
      },
    ],
    [base, pathName, isWorkspaceRoute, tab]
  )

  const SidebarSection = (
    <div className="bg-card flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-hidden border-r border-border">
      <div className="bg-card p-4 flex gap-2 justify-center items-center mb-2 absolute top-0 left-0 right-0 z-10">
        <Image
          src={CLIPFLOW_LOGO}
          height={36}
          width={36}
          alt="ClipFlow logo"
          className="object-contain"
        />
        <p className="text-xl font-bold clipflow-gradient-text">ClipFlow</p>
      </div>

      <div className="mt-16 flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={userName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <WorkspaceAvatar
            name={userName}
            className="h-10 w-10 shrink-0 rounded-full text-sm"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {userName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {workspaceName}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]"
          title="Your role in this workspace"
        >
          {role}
        </span>
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

      {workspace.subscription?.plan === 'FREE' && (
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
      <InfoBar workspaceId={activeWorkspaceId} />
      <div className="md:hidden fixed my-4">
        <Sheet>
          <SheetTrigger asChild className="ml-2">
            <Button variant={'ghost'} className="mt-[2px]">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side={'left'} className="p-0 w-fit h-full">
            {SidebarSection}
          </SheetContent>
        </Sheet>
      </div>
      <div className="md:block hidden h-full">{SidebarSection}</div>
    </div>
  )
}

export default Sidebar
