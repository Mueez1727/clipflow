import { onAuthenticateUser } from '@/actions/user'
import {
  getDashboardStats,
  getRecentVideos,
} from '@/actions/workspace'
import HomeDashboard from '@/components/global/dashboard/home-dashboard'
import React from 'react'

type Props = {
  params: { workspaceId: string }
}

const Home = async ({ params: { workspaceId } }: Props) => {
  const [statsResult, recentVideosResult, auth] = await Promise.all([
    getDashboardStats(workspaceId),
    getRecentVideos(workspaceId),
    onAuthenticateUser(),
  ])

  const userName =
    auth.user?.firstname?.trim() ||
    auth.user?.email?.split('@')[0] ||
    'there'

  const stats =
    statsResult.status === 200
      ? statsResult.data
      : {
          totalVideos: 0,
          totalFolders: 0,
          videosProcessed: 0,
          workspaceCount: 0,
          storageUsed: null,
        }

  const recentVideos =
    recentVideosResult.status === 200 ? recentVideosResult.data : []

  return (
    <HomeDashboard
      workspaceId={workspaceId}
      userName={userName}
      stats={stats}
      recentVideos={recentVideos}
    />
  )
}

export default Home
