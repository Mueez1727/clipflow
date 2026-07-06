import React from 'react'
import { onAuthenticateUser } from '@/actions/user'
import { getWorkSpaces, verifyAccessToWorkspace } from '@/actions/workspace'
import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { getUserNotifications } from '@/actions/notifications'
import { redirect } from 'next/navigation'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Sidebar from '@/components/global/sidebar'
import GlobalHeader from '@/components/global/global-header'
import DashboardSocketShell from '@/components/global/socket/dashboard-socket-shell'
import { PERSONAL_ROUTE } from '@/lib/personal-library'

type Props = {
  activeWorkspaceId: string
  children: React.ReactNode
  workspaceForHeader?: { id: string; name: string; type?: string }
}

const DashboardShell = async ({
  activeWorkspaceId,
  children,
  workspaceForHeader,
}: Props) => {
  const auth = await onAuthenticateUser()
  if (!auth.user) redirect('/auth/sign-in')

  let headerWorkspace = workspaceForHeader

  if (activeWorkspaceId !== PERSONAL_ROUTE) {
    const hasAccess = await verifyAccessToWorkspace(activeWorkspaceId)
    if (hasAccess.status !== 200 || !hasAccess.data?.workspace) {
      redirect(`/dashboard/${PERSONAL_ROUTE}/home`)
    }
    headerWorkspace = hasAccess.data.workspace
  } else {
    headerWorkspace = {
      id: PERSONAL_ROUTE,
      name: 'Personal Library',
      type: 'PERSONAL',
    }
  }

  const query = new QueryClient()

  await Promise.all([
    query.prefetchQuery({
      queryKey: ['user-workspaces'],
      queryFn: () => getWorkSpaces(),
    }),
    query.prefetchQuery({
      queryKey: ['joined-workspaces'],
      queryFn: () => getJoinedWorkspaces(),
    }),
    query.prefetchQuery({
      queryKey: ['user-notifications'],
      queryFn: () => getUserNotifications(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <DashboardSocketShell
        workspaceId={
          activeWorkspaceId === PERSONAL_ROUTE
            ? auth.user.id
            : activeWorkspaceId
        }
      >
        <div className="flex h-screen w-screen bg-background">
          <Sidebar activeWorkspaceId={activeWorkspaceId} />
          <div className="w-full overflow-x-hidden overflow-y-scroll bg-background p-4 pt-24 sm:p-6 sm:pt-28">
            <GlobalHeader workspace={headerWorkspace!} />
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </DashboardSocketShell>
    </HydrationBoundary>
  )
}

export default DashboardShell
