const DEFAULT_TITLES = new Set(['', 'Untilted Video', 'Untitled Video'])

export const isDefaultVideoTitle = (title: string | null | undefined) =>
  !title?.trim() || DEFAULT_TITLES.has(title.trim())

export type VideoMetadataContext = {
  createdAt: Date
  source: string
  workspaceName?: string | null
  workspaceType?: 'PUBLIC' | 'PERSONAL' | string | null
  folderName?: string | null
  isShared?: boolean
}

export const generateDefaultTitle = ({
  createdAt,
  source,
  workspaceName,
  workspaceType,
}: VideoMetadataContext): string => {
  const dateStr = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = createdAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const lower = source.toLowerCase()

  if (lower.includes('meeting') || lower.includes('call')) {
    return `Meeting Recording - ${dateStr}`
  }
  if (lower.includes('screen') || lower.includes('desktop') || lower.includes('display')) {
    return `Screen Recording - ${timeStr}`
  }
  if (lower.includes('demo')) {
    return 'Workspace Demo'
  }
  if (lower.includes('tutorial') || lower.includes('howto') || lower.includes('how-to')) {
    return `Tutorial - ${dateStr}`
  }
  if (workspaceName && workspaceType === 'PUBLIC') {
    return `Recording - ${workspaceName}`
  }

  return `Screen Recording - ${timeStr}`
}

export const generateSmartTags = ({
  createdAt,
  source,
  workspaceName,
  workspaceType,
  folderName,
  isShared = false,
}: VideoMetadataContext): string[] => {
  const tags = new Set<string>()
  const lower = source.toLowerCase()

  if (lower.includes('screen') || lower.includes('desktop') || lower.includes('display')) {
    tags.add('Screen Recording')
  }
  if (lower.includes('meeting') || lower.includes('call')) {
    tags.add('Meeting')
  }
  if (lower.includes('tutorial') || lower.includes('howto') || lower.includes('how-to')) {
    tags.add('Tutorial')
  }
  if (lower.includes('bug') || lower.includes('issue') || lower.includes('fix')) {
    tags.add('Bug')
  }

  if (workspaceType === 'PERSONAL') {
    tags.add('Personal')
  } else if (workspaceName) {
    tags.add(workspaceName)
  }

  if (isShared) {
    tags.add('Shared')
  }

  if (folderName && folderName !== 'Untitled Folder') {
    tags.add(folderName)
  }

  tags.add(
    createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  )

  const hour = createdAt.getHours()
  if (hour >= 5 && hour < 12) tags.add('Morning')
  else if (hour >= 12 && hour < 17) tags.add('Afternoon')
  else if (hour >= 17 && hour < 21) tags.add('Evening')
  else tags.add('Night')

  return Array.from(tags).slice(0, 10)
}
