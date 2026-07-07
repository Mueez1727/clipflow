'use client'

import { getWorkspaceAnalytics } from '@/actions/analytics'
import StatCard from '@/components/global/dashboard/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryData } from '@/hooks/useQueryData'
import {
  CheckCircle2,
  Clock,
  Crown,
  ListTodo,
  Share2,
  Users,
} from 'lucide-react'
import React from 'react'
import {
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

type AnalyticsData = {
  status: number
  data: {
    cards: {
      videosShared: number
      watchTime: string
      members: number
      mostActiveMember: string | null
      tasksCompleted: number
      pendingTasks: number
      totalViews: number
    }
    weeklyWorkspaceActivity: { label: string; value: number }[]
    weeklyActivity: { label: string; value: number }[]
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
    () => getWorkspaceAnalytics(workspaceId),
    true,
    { staleTime: 120_000, refetchOnMount: false }
  )

  const analytics = (data as AnalyticsData | undefined)?.data

  if (isPending || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const { cards } = analytics

  const cardConfig = [
    {
      title: 'Videos Shared',
      value: cards.videosShared,
      icon: Share2,
      gradient: 'bg-gradient-to-br from-blue-500/10 to-transparent',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Watch Time',
      value: cards.watchTime,
      icon: Clock,
      gradient: 'bg-gradient-to-br from-cyan-500/10 to-transparent',
      iconColor: 'text-cyan-500',
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cardConfig.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Workspace Activity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weeklyWorkspaceActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="label" {...chartAxis} />
              <YAxis allowDecimals={false} {...chartAxis} width={28} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#7C3AED11' }} />
              <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Engagement Trend">
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
    </div>
  )
}

export default React.memo(WorkspaceAnalytics)
