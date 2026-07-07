import { getAllUserVideos, getFolderInfo } from '@/actions/workspace'
import FolderInfo from '@/components/global/folders/folder'
import Videos from '@/components/global/videos'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import React from 'react'

type Props = {
  params: {
    folderId: string
    workspaceId: string
  }
}

const page = async ({ params: { folderId, workspaceId } }: Props) => {
  const query = new QueryClient()
  await Promise.all([
    query.prefetchQuery({
      queryKey: ['folder-videos', workspaceId, folderId],
      queryFn: () =>
        getAllUserVideos(workspaceId, { folderId, limit: 48 }),
    }),
    query.prefetchQuery({
      queryKey: ['folder-info', folderId],
      queryFn: () => getFolderInfo(folderId),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <FolderInfo folderId={folderId} />
      <Videos
        workspaceId={workspaceId}
        folderId={folderId}
        videosKey="folder-videos"
      />
    </HydrationBoundary>
  )
}

export default page