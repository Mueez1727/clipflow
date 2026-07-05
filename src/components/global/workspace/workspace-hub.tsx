'use client'

import { getJoinedWorkspaces } from '@/actions/collab-workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { LogIn, Plus, Users } from 'lucide-react'
import React from 'react'
import CreateWorkspaceModal from './create-workspace-modal'
import JoinWorkspaceModal from './join-workspace-modal'
import WorkspaceCard, { WorkspaceCardData } from './workspace-card'

const WorkspaceHub = () => {
  const { data, isPending } = useQueryData(
    ['joined-workspaces'],
    getJoinedWorkspaces
  )

  const workspaces =
    (data as { status: number; data: WorkspaceCardData[] } | undefined)?.data ??
    []

  const hasWorkspaces = workspaces.length > 0

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 animate-fade-in">
      <p className="text-muted-foreground">
        Collaborate with your team in shared workspaces.
      </p>
      {!hasWorkspaces && !isPending && (
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              No workspaces yet
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Create a workspace for your team or join one with an invite code.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CreateWorkspaceModal
              trigger={
                <Button className="btn-clipflow gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              }
            />
            <JoinWorkspaceModal
              trigger={
                <Button
                  variant="outline"
                  className="gap-2 border-red-500/40 text-red-600 hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogIn className="h-4 w-4" />
                  Join Workspace
                </Button>
              }
            />
          </div>
        </div>
      )}

      {isPending && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {hasWorkspaces && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws.id} workspace={ws} />
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <CreateWorkspaceModal
              trigger={
                <Button className="btn-clipflow gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              }
            />
            <JoinWorkspaceModal
              trigger={
                <Button
                  variant="outline"
                  className="gap-2 border-red-500/40 text-red-600 hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogIn className="h-4 w-4" />
                  Join Workspace
                </Button>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspaceHub
