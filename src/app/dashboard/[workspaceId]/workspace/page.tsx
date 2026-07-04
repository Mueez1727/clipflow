import { getWorkspaceDetails } from '@/actions/collab-workspace'
import WorkspaceDashboard from '@/components/global/workspace/workspace-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

type Props = {
  params: { workspaceId: string }
}

const WorkspacePage = async ({ params: { workspaceId } }: Props) => {
  const details = await getWorkspaceDetails(workspaceId)

  if (details.status !== 200 || !details.data) {
    redirect(`/dashboard/${workspaceId}`)
  }

  return (
    <Suspense
      fallback={<Skeleton className="h-96 w-full rounded-2xl" />}
    >
      <WorkspaceDashboard
        workspaceId={details.data.id}
        name={details.data.name}
        inviteCode={details.data.inviteCode}
        isOwner={details.data.isOwner}
        createdAt={details.data.createdAt}
        memberCount={details.data._count.members}
      />
    </Suspense>
  )
}

export default WorkspacePage
