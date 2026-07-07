'use client'

import { getWorkspaceMembers } from '@/actions/collab-workspace'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { formatRelativeTime } from '@/lib/utils'
import { Crown } from 'lucide-react'
import React from 'react'
import WorkspaceAvatar from './workspace-avatar'

type Members = {
  status: number
  data: {
    id: string
    firstname: string | null
    lastname: string | null
    image: string | null
    email: string
    isOwner: boolean
    joinedAt: Date | null
  }[]
}

const WorkspaceMembers = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isPending } = useQueryData(
    ['workspace-members', workspaceId],
    () => getWorkspaceMembers(workspaceId),
    true,
    { staleTime: 120_000, refetchOnMount: false }
  )

  const result = data as Members

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        {result?.data.length ?? 0}{' '}
        {(result?.data.length ?? 0) === 1 ? 'member' : 'members'}
      </p>
      {result?.data.map((member) => {
        const name = member.firstname
          ? `${member.firstname} ${member.lastname ?? ''}`.trim()
          : member.email
        return (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-[#7C3AED]/30"
          >
            {member.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.image}
                alt={name}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <WorkspaceAvatar name={name} className="h-11 w-11 text-base" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">{name}</p>
                {member.isOwner && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                    <Crown className="h-3 w-3" />
                    Owner
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {member.email}
              </p>
            </div>
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {member.isOwner ? 'Creator' : `Joined ${formatRelativeTime(member.joinedAt)}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default WorkspaceMembers
