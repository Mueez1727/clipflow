import React from 'react'
import DashboardShell from '@/components/global/dashboard/dashboard-shell'
import { PERSONAL_ROUTE } from '@/lib/personal-library'

type Props = {
  children: React.ReactNode
}

const WorkspaceSectionLayout = ({ children }: Props) => {
  return (
    <DashboardShell activeWorkspaceId={PERSONAL_ROUTE}>
      {children}
    </DashboardShell>
  )
}

export default WorkspaceSectionLayout
