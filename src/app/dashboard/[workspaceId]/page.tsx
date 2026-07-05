import {
  getAllUserVideos,
  getWorkspaceFolders,
} from '@/actions/workspace'
import CreateFolders from '@/components/global/create-folder'
import Folders from '@/components/global/folders'
import ArchivedLibrary from '@/components/global/folders/archived-library'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import React from 'react'

type Props = {
  params: { workspaceId: string }
}

const Page = async ({ params: { workspaceId } }: Props) => {
  const query = new QueryClient()

  await query.prefetchQuery({
    queryKey: ['workspace-folders'],
    queryFn: () => getWorkspaceFolders(workspaceId),
  })

  await query.prefetchQuery({
    queryKey: ['user-videos'],
    queryFn: () => getAllUserVideos(workspaceId),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div>
        <Tabs
          defaultValue="videos"
          className="mt-6"
        >
          <div className="flex w-full justify-between items-center">
            <TabsList className="bg-transparent gap-2 pl-0">
              <TabsTrigger
                className="rounded-full px-6 py-[13px] data-[state=active]:bg-card data-[state=active]:text-[#7C3AED]"
                value="videos"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="archive"
                className="rounded-full px-6 py-[13px] data-[state=active]:bg-card data-[state=active]:text-[#7C3AED]"
              >
                Archive
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-x-3">
              <CreateFolders workspaceId={workspaceId} />
            </div>
          </div>
          <section className="py-9">
            <TabsContent value="videos">
              <Folders workspaceId={workspaceId} />
            </TabsContent>
            <TabsContent value="archive">
              <ArchivedLibrary workspaceId={workspaceId} />
            </TabsContent>
          </section>
        </Tabs>
      </div>
    </HydrationBoundary>
  )
}

export default Page