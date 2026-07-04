import { ThemeToggle } from '@/components/website/theme-toggle'
import { UserButton } from '@clerk/nextjs'
import { Download, Settings } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import NotificationBell from '../notifications/notification-bell'
import WorkspaceSearch from '../workspace/workspace-search'
import { DESKTOP_APP_DOWNLOAD_URL } from '@/constants/app'

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground'

const InfoBar = ({ workspaceId }: { workspaceId: string }) => {
  return (
    <header className="fixed z-40 flex w-full items-center justify-between gap-4 border-b border-border bg-background/80 p-4 pl-20 backdrop-blur-xl md:pl-[265px]">
      <div className="flex w-full max-w-lg">
        <WorkspaceSearch workspaceId={workspaceId} />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href={DESKTOP_APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${iconButton} hidden sm:flex`}
          title="Download Desktop App"
        >
          <Download className="h-4 w-4" />
        </a>
        <Link
          href={`/dashboard/${workspaceId}/settings`}
          className={iconButton}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <NotificationBell />
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}

export default InfoBar
