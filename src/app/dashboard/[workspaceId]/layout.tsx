import React from 'react'
import { onAuthenticateUser } from '@/actions/user'
import { getWorkSpaces, verifyAccessToWorkspace } from '@/actions/workspace'
import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { getUnreadNotificationCount } from '@/actions/notifications'
import { redirect } from 'next/navigation'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Sidebar from '@/components/global/sidebar'
import GlobalHeader from '@/components/global/global-header'

type Props = {
  params: { workspaceId: string }
  children: React.ReactNode
}

const Layout = async ({ params: { workspaceId }, children }: Props) => {
  const auth = await onAuthenticateUser()
  if (!auth.user?.workspace) redirect('/auth/sign-in')
  if (!auth.user.workspace.length) redirect('/auth/sign-in')

  const hasAccess = await verifyAccessToWorkspace(workspaceId)

  if (hasAccess.status !== 200) {
    redirect(`/dashboard/${auth.user?.workspace[0].id}/home`)
  }

  if (!hasAccess.data?.workspace) return null

  const query = new QueryClient()

  // Only prefetch what the persistent shell (sidebar + navbar) needs.
  // Page-specific data (folders, videos, comments, tasks...) is prefetched
  // by each route so navigation isn't blocked by unrelated queries.
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
      queryKey: ['notifications-unread'],
      queryFn: () => getUnreadNotificationCount(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="flex h-screen w-screen bg-background">
        <Sidebar activeWorkspaceId={workspaceId} />
        <div className="w-full overflow-x-hidden overflow-y-scroll bg-background p-6 pt-28">
          <GlobalHeader workspace={hasAccess.data.workspace} />
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default Layout
