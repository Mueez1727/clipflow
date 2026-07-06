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

/**
 * Navbar spans the main content column only (right of the 250px sidebar on desktop).
 * Three-column grid pins profile left, search center, actions right.
 */
const InfoBar = ({ workspaceId, role }: Props) => {
  return (
    <header className="fixed top-0 z-40 grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background/95 px-3 py-3 backdrop-blur-xl sm:gap-4 sm:px-4 md:left-[250px] md:w-[calc(100%-250px)]">
      <div className="flex shrink-0 items-center justify-self-start">
        <UserProfileChip role={role} className="hidden md:flex" />
      </div>

      <div className="flex min-w-0 justify-center justify-self-center px-1 sm:px-2">
        <div className="w-full max-w-xl">
          <WorkspaceSearch workspaceId={workspaceId} />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end justify-self-end gap-2 sm:gap-3">
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

export default React.memo(InfoBar)
