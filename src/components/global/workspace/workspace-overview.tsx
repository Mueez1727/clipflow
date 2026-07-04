'use client'

import { getWorkspaceOverview } from '@/actions/collab-workspace'
import StatCard from '@/components/global/dashboard/stat-card'
import VideoCard from '@/components/global/videos/video-card'
import { Empty } from '@/components/icons/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { formatRelativeTime } from '@/lib/utils'
import { Activity, Users, Video } from 'lucide-react'
import React from 'react'
import WorkspaceAvatar from './workspace-avatar'

type OverviewData = {
  totalVideos: number
  memberCount: number
  latestVideos: {
    id: string
    title: string | null
    source: string
    processing: boolean
    createdAt: Date
    sharedAt: Date
    Folder: { id: string; name: string } | null
    User: { firstname: string | null; lastname: string | null; image: string | null } | null
  }[]
  recentActivity: {
    id: string
    type: string
    title: string
    author: string
    createdAt: Date
  }[]
  members: {
    id: string
    firstname: string | null
    lastname: string | null
    email: string
  }[]
}

const WorkspaceOverview = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isPending } = useQueryData(
    ['workspace-overview', workspaceId],
    () => getWorkspaceOverview(workspaceId)
  )

  const overview = (data as { status: number; data: OverviewData })?.data

  if (isPending || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Videos"
          value={overview.totalVideos}
          icon={Video}
          gradient="bg-gradient-to-br from-violet-500/10 via-card to-card"
          iconColor="text-violet-500"
        />
        <StatCard
          title="Members"
          value={overview.memberCount}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500/10 via-card to-card"
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#7C3AED]" />
            <h3 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          {overview.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {overview.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/10">
                    <Video className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.author} · {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#7C3AED]" />
            <h3 className="text-lg font-semibold text-foreground">Members</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {overview.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3"
              >
                <WorkspaceAvatar
                  name={`${member.firstname ?? member.email}`}
                  className="h-7 w-7 text-xs"
                />
                <span className="text-sm text-foreground">
                  {member.firstname
                    ? `${member.firstname} ${member.lastname ?? ''}`.trim()
                    : member.email}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Latest Shared Videos
        </h3>
        {overview.latestVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {overview.latestVideos.map((video) => (
              <VideoCard key={video.id} workspaceId={workspaceId} {...video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <div className="max-w-[220px] opacity-80">
              <Empty />
            </div>
            <p className="text-sm text-muted-foreground">
              No videos shared to this workspace yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceOverview
