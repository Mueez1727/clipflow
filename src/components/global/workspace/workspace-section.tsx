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

  const { data: workspaces } = (data as {
    status: number
    data: WorkspaceCardData[]
  }) ?? { status: 404, data: [] }

  return (
    <div className="w-full space-y-3">
      <p className="text-sm font-bold text-muted-foreground">Workspace</p>

      <div className="grid grid-cols-2 gap-2">
        <CreateWorkspaceModal
          trigger={
            <Button
              size="sm"
              className="btn-clipflow h-9 w-full gap-1.5 px-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              Create
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
              Join
            </Button>
          }
        />
      </div>

      <div className="fade-layer flex max-h-[220px] flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1">
        {isPending ? (
          <>
            <Skeleton className="h-[60px] w-full rounded-xl" />
            <Skeleton className="h-[60px] w-full rounded-xl" />
          </>
        ) : workspaces && workspaces.length > 0 ? (
          workspaces.map((ws) => <WorkspaceCard key={ws.id} workspace={ws} compact />)
        ) : (
          <p className="px-1 text-xs text-muted-foreground">
            No workspaces yet. Create or join one to collaborate.
          </p>
        )}
      </div>
    </div>
  )
}

export default WorkspaceSection
