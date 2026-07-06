'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import WorkspaceAvatar from './workspace-avatar'

const TabSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-28 w-full rounded-2xl" />
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
)

const WorkspaceOverview = dynamic(() => import('./workspace-overview'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceVideos = dynamic(() => import('./workspace-videos'), {
  loading: () => <TabSkeleton />,
})
const TaskBoard = dynamic(() => import('./task-board'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceAnalytics = dynamic(() => import('./workspace-analytics'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceActivity = dynamic(() => import('./workspace-activity'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceMembers = dynamic(() => import('./workspace-members'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceChat = dynamic(() => import('./workspace-chat'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceSettings = dynamic(() => import('./workspace-settings'), {
  loading: () => <TabSkeleton />,
})
const WorkspaceAiAssistant = dynamic(() => import('./workspace-ai-assistant'), {
  loading: () => <TabSkeleton />,
})

type Props = {
  workspaceId: string
  name: string
  inviteCode: string | null
  isOwner: boolean
  createdAt: Date
  memberCount: number
}

const TABS = [
  'overview',
  'videos',
  'tasks',
  'analytics',
  'activity',
  'members',
  'assistant',
  'chat',
  'settings',
] as const

const WorkspaceDashboard = (props: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const requested = searchParams.get('tab')
  const activeTab = (TABS as readonly string[]).includes(requested ?? '')
    ? (requested as string)
    : 'overview'

  const onTabChange = useCallback(
    (value: string) => {
      const query = value === 'overview' ? '' : `?tab=${value}`
      router.replace(`${pathname}${query}`, { scroll: false })
    },
    [pathname, router]
  )

  const header = useMemo(
    () => (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-[#7C3AED]/10 via-card to-card p-6 shadow-sm sm:flex-row sm:items-center">
        <WorkspaceAvatar name={props.name} className="h-16 w-16 text-2xl" />
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7C3AED]">
            Private Workspace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {props.name}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {props.memberCount} {props.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
    ),
    [props.memberCount, props.name]
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in">
      {header}

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="flex h-auto w-full max-w-full flex-nowrap justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-1 scrollbar-thin">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-full border border-transparent px-5 py-2 capitalize transition-colors hover:border-border hover:bg-accent/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-[#7C3AED] dark:hover:bg-accent/40"
            >
              {tab === 'assistant' ? 'AI Assistant' : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <WorkspaceOverview workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="videos" className="mt-0">
            <WorkspaceVideos workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-0">
            <TaskBoard workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <WorkspaceAnalytics workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <WorkspaceActivity workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="members" className="mt-0">
            <WorkspaceMembers workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="assistant" className="mt-0">
            <WorkspaceAiAssistant workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="chat" className="mt-0">
            <WorkspaceChat workspaceId={props.workspaceId} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <WorkspaceSettings
              workspaceId={props.workspaceId}
              name={props.name}
              inviteCode={props.inviteCode}
              isOwner={props.isOwner}
              createdAt={props.createdAt}
              memberCount={props.memberCount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default React.memo(WorkspaceDashboard)
