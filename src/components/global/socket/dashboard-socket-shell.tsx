'use client'

import SocketRealtimeBridge from '@/components/global/socket/socket-realtime-bridge'
import React from 'react'

type Props = {
  workspaceId: string
  children: React.ReactNode
}

/**
 * Client shell that activates realtime sync for the current workspace.
 */
const DashboardSocketShell = ({ workspaceId, children }: Props) => {
  return (
    <>
      <SocketRealtimeBridge workspaceId={workspaceId} />
      {children}
    </>
  )
}

export default DashboardSocketShell
