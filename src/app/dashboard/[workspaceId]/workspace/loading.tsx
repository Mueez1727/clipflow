import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const WorkspaceLoading = () => {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export default WorkspaceLoading
