'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import { Clock, Crown, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import WorkspaceAvatar from './workspace-avatar'

export type WorkspaceCardData = {
  id: string
  name: string
  memberCount: number
  videoCount?: number
  lastActivity?: Date | string | null
  isOwner?: boolean
}

type Props = {
  workspace: WorkspaceCardData
  compact?: boolean
}

const WorkspaceCard = ({ workspace, compact }: Props) => {
  return (
    <Link
      href={`/dashboard/${workspace.id}/workspace`}
      className={cn(
        'group flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7C3AED]/40 hover:shadow-md',
        compact ? 'w-full' : 'w-full'
      )}
    >
      <WorkspaceAvatar
        name={workspace.name}
        className={cn('shrink-0', compact ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base')}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-[#7C3AED]">
            {workspace.name}
          </p>
          {workspace.isOwner && (
            <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {workspace.memberCount}
          </span>
          <span className="truncate text-foreground/70">Private Workspace</span>
          <span className="hidden items-center gap-1 truncate sm:flex">
            <Clock className="h-3 w-3 shrink-0" />
            {formatRelativeTime(workspace.lastActivity)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default React.memo(WorkspaceCard)
