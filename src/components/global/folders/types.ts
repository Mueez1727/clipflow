export type FolderItem = {
  id: string
  name: string
  createdAt: Date
  workSpaceId: string | null
  _count: {
    videos: number
  }
}

export type FoldersProps = {
  status: number
  data: FolderItem[]
}
