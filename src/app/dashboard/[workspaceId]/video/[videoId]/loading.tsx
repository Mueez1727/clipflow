import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const VideoLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-5 overflow-y-auto lg:py-10 xl:grid-cols-3">
      <div className="flex flex-col gap-y-10 lg:col-span-2">
        <div className="space-y-3">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex flex-col gap-y-10 lg:col-span-1">
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default VideoLoading
