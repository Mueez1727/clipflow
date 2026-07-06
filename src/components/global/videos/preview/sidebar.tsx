'use client'

import CopyLink from '../copy-link'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Download } from 'lucide-react'
import React from 'react'

type Props = {
  videoId: string
  source: string
}

const VideoPreviewSidebar = ({ videoId, source }: Props) => {
  const downloadUrl = `${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${source}`

  return (
    <div className="flex flex-col gap-y-6 lg:col-span-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button asChild size="lg" className="btn-clipflow w-full sm:w-auto sm:min-w-[180px]">
          <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-5 w-5" />
            Download Video
          </a>
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full sm:w-auto">
                <CopyLink
                  variant="outline"
                  className="h-10 w-full rounded-full border-border bg-transparent px-6 text-sm sm:w-auto"
                  videoId={videoId}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Copy Link</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default React.memo(VideoPreviewSidebar)
