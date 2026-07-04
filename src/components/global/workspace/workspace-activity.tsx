'use client'

import { getWorkspaceActivity } from '@/actions/activity'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { Activity } from 'lucide-react'
import React from 'react'
import ActivityTimeline, { ActivityRow } from './activity-timeline'

const WorkspaceActivity = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isPending } = useQueryData(
    ['workspace-activity', workspaceId],
    () => getWorkspaceActivity(workspaceId)
  )

  const activities = (data as { data: ActivityRow[] } | undefined)?.data ?? []

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#7C3AED]" />
        <h2 className="text-lg font-semibold text-foreground">Activity Feed</h2>
      </div>
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ActivityTimeline activities={activities} />
      )}
    </div>
  )
}

export default WorkspaceActivity
