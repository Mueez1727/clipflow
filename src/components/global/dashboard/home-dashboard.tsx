'use client'

import StatCard from '@/components/global/dashboard/stat-card'
import VideoCard from '@/components/global/videos/video-card'
import { Empty } from '@/components/icons/empty'
import { Button } from '@/components/ui/button'
import { DESKTOP_APP_DOWNLOAD_URL } from '@/constants/app'
import { useCreateFolders } from '@/hooks/useCreateFolder'
import { cn } from '@/lib/utils'
import {
  Download,
  FolderOpen,
  FolderPlus,
  HardDrive,
  LayoutGrid,
  Video,
  Video as VideoRecord,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

type DashboardStats = {
  totalVideos: number
  totalFolders: number
  workspaceCount: number
  storageUsed: string | null
}

type RecentVideo = {
  id: string
  title: string | null
  createdAt: Date
  source: string
  processing: boolean
  Folder: {
    id: string
    name: string
  } | null
  User: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
}

type Props = {
  workspaceId: string
  userName: string
  stats: DashboardStats
  recentVideos: RecentVideo[]
}

const HomeDashboard = ({ workspaceId, userName, stats, recentVideos }: Props) => {
  const { onCreateNewFolder } = useCreateFolders(workspaceId)

  const statCards = [
    {
      title: 'Total Videos',
      value: stats.totalVideos,
      icon: Video,
      gradient: 'bg-gradient-to-br from-violet-500/10 via-card to-card',
      iconColor: 'text-violet-500',
    },
    {
      title: 'Total Folders',
      value: stats.totalFolders,
      icon: FolderOpen,
      gradient: 'bg-gradient-to-br from-blue-500/10 via-card to-card',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Storage Used',
      value: stats.storageUsed ?? '—',
      icon: HardDrive,
      gradient: 'bg-gradient-to-br from-amber-500/10 via-card to-card',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Workspaces',
      value: stats.workspaceCount,
      icon: LayoutGrid,
      gradient: 'bg-gradient-to-br from-emerald-500/10 via-card to-card',
      iconColor: 'text-emerald-500',
    },
  ]

  const onRecordScreen = () => {
    toast('Start recording in the ClipFlow desktop app', {
      description: 'Download or open the desktop app to capture your screen.',
    })
    window.open(DESKTOP_APP_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-[#7C3AED]/15 via-card/70 to-card/40 p-8 shadow-sm backdrop-blur-xl md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#A78BFA]/20 blur-3xl" />
        <div className="relative space-y-3">
          <p className="text-sm font-medium text-[#7C3AED]">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Welcome back, {userName}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Manage your recordings, organize folders, and process videos with AI.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            onClick={onCreateNewFolder}
            className="glass-card h-auto flex-col gap-3 px-6 py-8 text-base hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-lg"
            variant="ghost"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FolderPlus className="h-6 w-6" />
            </span>
            <span>Create Folder</span>
          </Button>

          <Button
            onClick={onRecordScreen}
            className="glass-card h-auto flex-col gap-3 px-6 py-8 text-base hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-lg"
            variant="ghost"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <VideoRecord className="h-6 w-6" />
            </span>
            <span>Record Screen</span>
          </Button>

          <Button
            asChild
            className="glass-card h-auto flex-col gap-3 px-6 py-8 text-base hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-lg"
            variant="ghost"
          >
            <a
              href={DESKTOP_APP_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Download className="h-6 w-6" />
              </span>
              <span>Download Desktop App</span>
            </a>
          </Button>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Latest Videos</h2>
          {recentVideos.length > 0 && (
            <Link
              href={`/dashboard/${workspaceId}`}
              className="text-sm text-muted-foreground transition-colors hover:text-[#7C3AED]"
            >
              View all
            </Link>
          )}
        </div>

        {recentVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recentVideos.map((video) => (
              <VideoCard key={video.id} workspaceId={workspaceId} {...video} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center'
            )}
          >
            <div className="max-w-xs opacity-80">
              <Empty />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                No videos yet
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Record with the desktop app to see your latest videos here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="btn-clipflow gap-2">
                <a
                  href={DESKTOP_APP_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Download Desktop App
                </a>
              </Button>
              <Button asChild variant="outline" className="btn-clipflow-outline gap-2">
                <Link href={`/dashboard/${workspaceId}`}>Go to My Library</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default React.memo(HomeDashboard)
