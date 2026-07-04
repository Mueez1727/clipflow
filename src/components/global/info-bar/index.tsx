import UserProfileChip from '@/components/global/dashboard/user-profile-chip'
import { DesktopDownloadLink } from '@/components/global/desktop-app-launcher'
import { ThemeToggle } from '@/components/website/theme-toggle'
import { UserButton } from '@clerk/nextjs'
import { Download } from 'lucide-react'
import React from 'react'
import NotificationBell from '../notifications/notification-bell'
import WorkspaceSearch from '../workspace/workspace-search'

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground'

type Props = {
  workspaceId: string
  role: 'Owner' | 'Member'
}

const InfoBar = ({ workspaceId, role }: Props) => {
  return (
    <header className="fixed z-40 flex w-full items-center justify-between gap-3 border-b border-border bg-background/80 p-3 pl-16 backdrop-blur-xl sm:gap-4 sm:p-4 md:pl-[265px]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UserProfileChip role={role} className="hidden shrink-0 md:flex" />
        <div className="min-w-0 flex-1 max-w-lg">
          <WorkspaceSearch workspaceId={workspaceId} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <DesktopDownloadLink
          className={`${iconButton} hidden sm:flex`}
          aria-label="Download Desktop App"
        >
          <Download className="h-4 w-4" />
        </DesktopDownloadLink>
        <NotificationBell />
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}

export default InfoBar
