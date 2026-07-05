import React from 'react'
import DashboardShell from '@/components/global/dashboard/dashboard-shell'

type Props = {
  params: { workspaceId: string }
  children: React.ReactNode
}

const Layout = async ({ params: { workspaceId }, children }: Props) => {
  return (
    <DashboardShell activeWorkspaceId={workspaceId}>
      {children}
    </DashboardShell>
  )
}

export default Layout
