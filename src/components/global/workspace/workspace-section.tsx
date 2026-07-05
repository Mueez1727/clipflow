'use client'

import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import React from 'react'
import WorkspaceCard, { WorkspaceCardData } from './workspace-card'

const WorkspaceSection = () => {
  const { data, isPending } = useQueryData(
    ['joined-workspaces'],
    getJoinedWorkspaces
  )

  const workspaces =
    (data as { status: number; data: WorkspaceCardData[] } | undefined)?.data ??
    []

  const hasWorkspaces = workspaces.length > 0

  return (
    <div className="flex w-full shrink-0 flex-col space-y-3">
      <p className="text-sm font-bold text-muted-foreground">Recent Workspaces</p>

      {!hasWorkspaces && !isPending && (
        <p className="px-1 text-xs text-muted-foreground">
          No workspaces joined yet
        </p>
      )}

      <div className="flex flex-col gap-2">
        {isPending ? (
          <>
            <Skeleton className="h-[68px] w-full shrink-0 rounded-xl" />
            <Skeleton className="h-[68px] w-full shrink-0 rounded-xl" />
          </>
        ) : hasWorkspaces ? (
          workspaces.slice(0, 5).map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} compact />
          ))
        ) : null}
      </div>
    </div>
  )
}

export default WorkspaceSection
