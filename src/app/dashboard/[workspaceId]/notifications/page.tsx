'use client'

import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/notifications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  AtSign,
  Bell,
  CheckCheck,
  CircleDashed,
  ClipboardList,
  MessageSquare,
  Share2,
  ShieldCheck,
  UserPlus,
  LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

type NotificationItem = {
  id: string
  content: string
  type: string | null
  read: boolean
  link: string | null
  createdAt: string | Date
  actor: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
}

const TYPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  WORKSPACE_JOINED: { icon: UserPlus, color: 'bg-pink-500/10 text-pink-500' },
  COMMENT_ADDED: { icon: MessageSquare, color: 'bg-violet-500/10 text-violet-500' },
  VIDEO_SHARED: { icon: Share2, color: 'bg-blue-500/10 text-blue-500' },
  TASK_ASSIGNED: { icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600' },
  MENTION: { icon: AtSign, color: 'bg-[#7C3AED]/10 text-[#7C3AED]' },
  VIDEO_APPROVED: { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600' },
  VIDEO_NEEDS_CHANGES: { icon: CircleDashed, color: 'bg-amber-500/10 text-amber-600' },
}

const Notifications = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isPending } = useQueryData(
    ['user-notifications'],
    getUserNotifications
  )

  const result = data as
    | { status: number; data: NotificationItem[]; unread: number }
    | undefined
  const notifications = result?.data ?? []
  const unread = result?.unread ?? 0

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  const onOpen = async (item: NotificationItem) => {
    if (!item.read) {
      await markNotificationRead(item.id)
      refresh()
    }
    if (item.link) router.push(item.link)
  }

  const markAll = async () => {
    await markAllNotificationsRead()
    refresh()
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAll} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED]/10">
            <Bell className="h-7 w-7 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              Activity from your workspaces will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => {
            const meta = TYPE_ICON[item.type ?? ''] ?? {
              icon: Bell,
              color: 'bg-muted text-muted-foreground',
            }
            const Icon = meta.icon
            const actorName = item.actor
              ? `${item.actor.firstname ?? ''} ${item.actor.lastname ?? ''}`.trim()
              : ''
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item)}
                className={cn(
                  'glass-card flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                  !item.read && 'border-[#7C3AED]/30 bg-[#7C3AED]/5'
                )}
              >
                {item.actor?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.actor.image}
                    alt={actorName}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      meta.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
                {!item.read && (
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#7C3AED]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
