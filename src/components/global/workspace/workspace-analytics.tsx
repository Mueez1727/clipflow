'use client'

import { getWorkspaceActivity } from '@/actions/activity'
import { getWorkspaceAnalytics } from '@/actions/analytics'
import StatCard from '@/components/global/dashboard/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import {
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  HardDrive,
  ListTodo,
  Share2,
  Users,
  Video,
} from 'lucide-react'
import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ActivityTimeline, { ActivityRow } from './activity-timeline'

type AnalyticsData = {
  status: number
  data: {
    cards: {
      videosThisWeek: number
      videosShared: number
      watchTime: string | null
      storageUsed: string | null
      members: number
      mostActiveMember: string | null
      tasksCompleted: number
      pendingTasks: number
      totalViews: number
    }
    weeklyUploads: { label: string; value: number }[]
    weeklyActivity: { label: string; value: number }[]
    recordingTrend: { label: string; value: number }[]
  }
}

const chartAxis = {
  stroke: '#94a3b8',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--popover))',
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
}

const ChartCard = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="glass-card rounded-2xl p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
    <div className="h-56 w-full">{children}</div>
  </div>
)

const WorkspaceAnalytics = ({ workspaceId }: { workspaceId: string }) => {
  const { data, isPending } = useQueryData(
    ['workspace-analytics', workspaceId],
    () => getWorkspaceAnalytics(workspaceId)
  )
  const { data: activityData } = useQueryData(
    ['workspace-activity', workspaceId],
    () => getWorkspaceActivity(workspaceId, 8)
  )

  const analytics = (data as AnalyticsData | undefined)?.data
  const activities =
    (activityData as { data: ActivityRow[] } | undefined)?.data ?? []

  if (isPending || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const { cards } = analytics

  const cardConfig = [
    {
      title: 'Videos This Week',
      value: cards.videosThisWeek,
      icon: Video,
      gradient: 'bg-gradient-to-br from-violet-500/10 to-transparent',
      iconColor: 'text-violet-500',
    },
    {
      title: 'Videos Shared',
      value: cards.videosShared,
      icon: Share2,
      gradient: 'bg-gradient-to-br from-blue-500/10 to-transparent',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Watch Time',
      value: cards.watchTime ?? '—',
      icon: Clock,
      gradient: 'bg-gradient-to-br from-cyan-500/10 to-transparent',
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Storage Used',
      value: cards.storageUsed ?? '—',
      icon: HardDrive,
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Workspace Members',
      value: cards.members,
      icon: Users,
      gradient: 'bg-gradient-to-br from-pink-500/10 to-transparent',
      iconColor: 'text-pink-500',
    },
    {
      title: 'Most Active Member',
      value: cards.mostActiveMember ?? '—',
      icon: Crown,
      gradient: 'bg-gradient-to-br from-amber-500/10 to-transparent',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Tasks Completed',
      value: cards.tasksCompleted,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Pending Tasks',
      value: cards.pendingTasks,
      icon: ListTodo,
      gradient: 'bg-gradient-to-br from-orange-500/10 to-transparent',
      iconColor: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cardConfig.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Weekly Uploads">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weeklyUploads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="label" {...chartAxis} />
              <YAxis allowDecimals={false} {...chartAxis} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#7C3AED11' }} />
              <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Workspace Activity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="label" {...chartAxis} />
              <YAxis allowDecimals={false} {...chartAxis} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Recording Trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.recordingTrend}>
                <defs>
                  <linearGradient id="recFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="label" {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fill="url(#recFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="max-h-56 overflow-y-auto pr-1">
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceAnalytics
