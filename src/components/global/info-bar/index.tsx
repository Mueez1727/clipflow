import UserProfileChip from '@/components/global/dashboard/user-profile-chip'
import { DesktopDownloadLink } from '@/components/global/desktop-app-launcher'
import { ThemeToggle } from '@/components/website/theme-toggle'
import { UserButton } from '@clerk/nextjs'
import { Download } from 'lucide-react'
import React from 'react'
import NotificationBell from '../notifications/notification-bell'
import WorkspaceSearch from '../workspace/workspace-search'

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'

type Props = {
  workspaceId: string
  role: 'Owner' | 'Member'
}

const InfoBar = ({ workspaceId, role }: Props) => {
  return (
    <header className="fixed z-40 flex w-full items-center border-b border-border bg-background/95 p-3 backdrop-blur-xl sm:gap-4 sm:p-4 md:pl-[265px]">
      <div className="flex shrink-0 items-center">
        <UserProfileChip role={role} className="hidden md:flex" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 px-16 sm:px-24 md:px-32">
        <div className="pointer-events-auto mx-auto w-full">
          <WorkspaceSearch workspaceId={workspaceId} />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
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
