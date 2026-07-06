'use client'

import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/notifications'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import React, { useState } from 'react'

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

type NotificationResult = {
  status: number
  data: NotificationItem[]
  unread: number
}

const TYPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  WORKSPACE_JOINED: { icon: UserPlus, color: 'bg-pink-500/10 text-pink-500' },
  WORKSPACE_LEFT: { icon: UserPlus, color: 'bg-orange-500/10 text-orange-500' },
  MEMBER_REMOVED: { icon: UserPlus, color: 'bg-rose-500/10 text-rose-500' },
  COMMENT_ADDED: { icon: MessageSquare, color: 'bg-violet-500/10 text-violet-500' },
  VIDEO_SHARED: { icon: Share2, color: 'bg-blue-500/10 text-blue-500' },
  VIDEO_UPLOADED: { icon: Share2, color: 'bg-blue-500/10 text-blue-500' },
  VIDEO_DELETED: { icon: Share2, color: 'bg-red-500/10 text-red-500' },
  VIDEO_MOVED: { icon: Share2, color: 'bg-indigo-500/10 text-indigo-500' },
  MESSAGE_SENT: { icon: MessageSquare, color: 'bg-sky-500/10 text-sky-500' },
  TASK_CREATED: { icon: ClipboardList, color: 'bg-indigo-500/10 text-indigo-500' },
  TASK_UPDATED: { icon: ClipboardList, color: 'bg-violet-500/10 text-violet-500' },
  TASK_IN_PROGRESS: { icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600' },
  TASK_COMPLETED: { icon: CheckCheck, color: 'bg-emerald-500/10 text-emerald-600' },
  TASK_ASSIGNED: { icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600' },
  MENTION: { icon: AtSign, color: 'bg-[#7C3AED]/10 text-[#7C3AED]' },
  VIDEO_APPROVED: { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600' },
  VIDEO_NEEDS_CHANGES: { icon: CircleDashed, color: 'bg-amber-500/10 text-amber-600' },
}

const NotificationBell = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data, isPending, isFetching, refetch } = useQueryData(
    ['user-notifications'],
    getUserNotifications,
    true,
    { staleTime: 30_000, refetchOnWindowFocus: true }
  )

  const result = data as NotificationResult | undefined
  const notifications = result?.data ?? []
  const unread = result?.unread ?? 0
  const loadingList = open && (isPending || (isFetching && !result))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) void refetch()
  }

  const onOpen = async (item: NotificationItem) => {
    if (!item.read) {
      await markNotificationRead(item.id)
      refresh()
    }
    setOpen(false)
    if (item.link) router.push(item.link)
  }

  const markAll = async () => {
    await markAllNotificationsRead()
    refresh()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="flex items-center gap-1 text-xs text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loadingList ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const meta = TYPE_ICON[item.type ?? ''] ?? {
                icon: Bell,
                color: 'bg-muted text-muted-foreground',
              }
              const Icon = meta.icon
              const actorName = item.actor
                ? `${item.actor.firstname ?? ''} ${
                    item.actor.lastname ?? ''
                  }`.trim()
                : ''
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpen(item)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/60',
                    !item.read && 'bg-[#7C3AED]/5'
                  )}
                >
                  {item.actor?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.actor.image}
                      alt={actorName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        meta.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground">
                      {item.content}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#7C3AED]" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
