'use client'

import { Separator } from '@/components/ui/separator'
import { formatRelativeTime } from '@/lib/utils'
import { CalendarDays, Globe, Users } from 'lucide-react'
import React from 'react'
import CopyField from './copy-field'
import WorkspaceAvatar from './workspace-avatar'

type Props = {
  workspaceId: string
  name: string
  inviteCode: string | null
  isOwner: boolean
  createdAt: Date
  memberCount: number
}

const WorkspaceSettings = ({
  name,
  inviteCode,
  isOwner,
  createdAt,
  memberCount,
}: Props) => {
  const hostUrl =
    process.env.NEXT_PUBLIC_HOST_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  const joinLink = inviteCode ? `${hostUrl}/join/${inviteCode}` : ''

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <WorkspaceAvatar name={name} className="h-14 w-14 text-xl" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'You own this workspace' : 'You are a member'}
            </p>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Public
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatRelativeTime(createdAt)}
          </div>
        </div>
      </div>

      {inviteCode && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Invite people
          </h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Anyone with the join code or link can join this workspace.
          </p>
          <div className="space-y-4">
            <CopyField label="Join Code" value={inviteCode} />
            <CopyField label="Join Link" value={joinLink} />
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspaceSettings
