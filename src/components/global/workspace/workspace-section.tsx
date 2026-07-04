'use client'

import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { LogIn, Plus } from 'lucide-react'
import React from 'react'
import CreateWorkspaceModal from './create-workspace-modal'
import JoinWorkspaceModal from './join-workspace-modal'
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
    <div className="flex w-full min-h-0 flex-1 flex-col space-y-3">
      <p className="text-sm font-bold text-muted-foreground">Recent Workspaces</p>

      {!hasWorkspaces && !isPending && (
        <>
          <p className="px-1 text-xs text-muted-foreground">No Workspaces Joined</p>
          <div className="grid grid-cols-2 gap-2">
            <CreateWorkspaceModal
              trigger={
                <Button
                  size="sm"
                  className="btn-clipflow h-9 w-full gap-1.5 px-2 text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              }
            />
            <JoinWorkspaceModal
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-clipflow-outline h-9 w-full gap-1.5 px-2 text-xs"
                >
                  <LogIn className="h-4 w-4" />
                  Join Workspace
                </Button>
              }
            />
          </div>
        </>
      )}

      <div className="fade-layer flex min-h-0 max-h-[280px] flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1">
        {isPending ? (
          <>
            <Skeleton className="h-[68px] w-full shrink-0 rounded-xl" />
            <Skeleton className="h-[68px] w-full shrink-0 rounded-xl" />
          </>
        ) : hasWorkspaces ? (
          workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} compact />
          ))
        ) : null}
      </div>
    </div>
  )
}

export default WorkspaceSection
