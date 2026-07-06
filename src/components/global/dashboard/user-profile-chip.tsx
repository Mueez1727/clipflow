'use client'

import WorkspaceAvatar from '@/components/global/workspace/workspace-avatar'
import { cn } from '@/lib/utils'
import { useClerkUser } from '@/providers/ClerkUserProvider'
import React from 'react'

type Props = {
  role: 'Owner' | 'Member'
  className?: string
}

const UserProfileChip = ({ role, className }: Props) => {
  const { user } = useClerkUser()
  const userName = user?.fullName || user?.firstName || 'Your account'

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border border-border bg-card/80 px-3 py-1.5',
        className
      )}
    >
      {user?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.imageUrl}
          alt={userName}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <WorkspaceAvatar
          name={userName}
          className="h-8 w-8 shrink-0 rounded-full text-xs"
        />
      )}
      <span className="hidden max-w-[120px] truncate text-sm font-semibold text-foreground sm:inline">
        {userName}
      </span>
      <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
        {role}
      </span>
    </div>
  )
}

export default React.memo(UserProfileChip)
