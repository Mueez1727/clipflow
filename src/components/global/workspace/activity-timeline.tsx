'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import {
  CheckCircle2,
  MessageSquare,
  Pin,
  Share2,
  ShieldCheck,
  UserPlus,
  ClipboardList,
  Activity as ActivityIcon,
  LucideIcon,
} from 'lucide-react'
import React from 'react'
import WorkspaceAvatar from './workspace-avatar'

export type ActivityRow = {
  id: string
  type: string
  content: string
  createdAt: string | Date
  User: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
}

const ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  VIDEO_SHARED: { icon: Share2, color: 'bg-blue-500/10 text-blue-500' },
  COMMENT_ADDED: { icon: MessageSquare, color: 'bg-violet-500/10 text-violet-500' },
  TASK_ASSIGNED: { icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600' },
  TASK_COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600' },
  WORKSPACE_JOINED: { icon: UserPlus, color: 'bg-pink-500/10 text-pink-500' },
  VIDEO_APPROVED: { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600' },
  VIDEO_PINNED: { icon: Pin, color: 'bg-[#7C3AED]/10 text-[#7C3AED]' },
}

const actorName = (user: ActivityRow['User']) =>
  user
    ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || 'Someone'
    : 'Someone'

const ActivityTimeline = ({ activities }: { activities: ActivityRow[] }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <ActivityIcon className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-1">
      {activities.map((activity, index) => {
        const meta = ICONS[activity.type] ?? {
          icon: ActivityIcon,
          color: 'bg-muted text-muted-foreground',
        }
        const Icon = meta.icon
        const name = actorName(activity.User)
        const isLast = index === activities.length - 1
        return (
          <div key={activity.id} className="relative flex gap-3 pb-4">
            {!isLast && (
              <span className="absolute left-[18px] top-9 h-full w-px bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                meta.color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm text-foreground">
                <span className="inline-flex items-center gap-1.5 align-middle">
                  {activity.User?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activity.User.image}
                      alt={name}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  ) : (
                    <WorkspaceAvatar
                      name={name}
                      className="h-4 w-4 rounded-full text-[8px]"
                    />
                  )}
                  <span className="font-medium">{name}</span>
                </span>{' '}
                <span className="text-muted-foreground">{activity.content}</span>
              </p>
              <p className="text-xs text-muted-foreground/70">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityTimeline
