'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DESKTOP_APP_DOWNLOAD_URL,
  buildDesktopRecordUrl,
} from '@/constants/app'
import { useClerkUser } from '@/providers/ClerkUserProvider'
import { Download, MonitorPlay } from 'lucide-react'
import React, { useCallback, useState } from 'react'

type Props = {
  trigger?: React.ReactNode
  onLaunch?: () => void
}

export const DesktopAppLauncher = ({ trigger, onLaunch }: Props) => {
  const { user } = useClerkUser()
  const [open, setOpen] = useState(false)

  const tryLaunchDesktop = useCallback(() => {
    onLaunch?.()
    const protocolUrl = buildDesktopRecordUrl(user?.id)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = protocolUrl
    document.body.appendChild(iframe)
    window.setTimeout(() => {
      document.body.removeChild(iframe)
      setOpen(true)
    }, 900)
  }, [onLaunch, user?.id])

  return (
    <>
      {trigger ? (
        <span onClick={tryLaunchDesktop} className="contents">
          {trigger}
        </span>
      ) : (
        <Button
          type="button"
          onClick={tryLaunchDesktop}
          className="glass-card h-auto flex-col gap-3 px-6 py-8 text-base hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-lg"
          variant="ghost"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <MonitorPlay className="h-6 w-6" />
          </span>
          <span>Record Screen</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desktop app required</DialogTitle>
            <DialogDescription>
              Screen recording runs in the ClipFlow desktop application. Open the
              app if it&apos;s installed, or download it below.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="btn-clipflow w-full gap-2"
              onClick={() => {
                window.location.href = buildDesktopRecordUrl(user?.id)
              }}
            >
              <MonitorPlay className="h-4 w-4" />
              Open Desktop App
            </Button>
            <Button asChild variant="outline" className="btn-clipflow-outline w-full gap-2">
              <a
                href={DESKTOP_APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Download Desktop App
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const DesktopDownloadLink = ({
  children,
  className,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}) => (
  <a
    href={DESKTOP_APP_DOWNLOAD_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    aria-label={ariaLabel}
  >
    {children}
  </a>
)
