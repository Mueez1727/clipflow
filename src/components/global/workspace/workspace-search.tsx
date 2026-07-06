'use client'

import { globalSearch } from '@/actions/global-search'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PERSONAL_ROUTE } from '@/lib/personal-library'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  FolderOpen,
  LayoutGrid,
  Loader2,
  Search,
  Video as VideoIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

type SearchData = {
  personalVideos: { id: string; title: string | null }[]
  personalFolders: { id: string; name: string }[]
  workspaces: { id: string; name: string }[]
  workspaceVideos: {
    id: string
    title: string | null
    workSpaceId: string | null
  }[]
  workspaceTasks: {
    id: string
    title: string
    workSpaceId: string
    status: string
  }[]
}

const WorkspaceSearch = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 150)
    return () => clearTimeout(t)
  }, [term])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: () => globalSearch(debounced),
    enabled: open && debounced.length > 0,
    staleTime: 30_000,
  })

  const results = (data as { data: SearchData } | undefined)?.data
  const total = useMemo(() => {
    if (!results) return 0
    return (
      results.personalVideos.length +
      results.personalFolders.length +
      results.workspaces.length +
      results.workspaceVideos.length +
      results.workspaceTasks.length
    )
  }, [results])

  const go = (path: string) => {
    setOpen(false)
    setTerm('')
    router.push(path)
  }

  const resolveWorkspaceId = (id: string | null) =>
    id && id !== PERSONAL_ROUTE ? id : workspaceId !== PERSONAL_ROUTE ? workspaceId : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-lg items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:border-[#7C3AED]/40"
      >
        <Search size={18} className="shrink-0" />
        <span className="flex-1 truncate text-left">Search videos, folders, workspaces...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Global search</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search personal library and workspaces..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isFetching && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {debounced.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Search your personal library and workspaces.
              </p>
            ) : total === 0 && !isFetching ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No results for &quot;{debounced}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                <ResultGroup
                  label="Personal · Videos"
                  icon={VideoIcon}
                  items={results?.personalVideos ?? []}
                  render={(v) => v.title ?? 'Untitled video'}
                  onSelect={(v) =>
                    go(`/dashboard/${PERSONAL_ROUTE}/video/${v.id}`)
                  }
                />
                <ResultGroup
                  label="Personal · Folders"
                  icon={FolderOpen}
                  items={results?.personalFolders ?? []}
                  render={(f) => f.name}
                  onSelect={(f) =>
                    go(`/dashboard/${PERSONAL_ROUTE}/folder/${f.id}`)
                  }
                />
                <ResultGroup
                  label="Workspaces"
                  icon={LayoutGrid}
                  items={results?.workspaces ?? []}
                  render={(w) => w.name}
                  onSelect={(w) => go(`/dashboard/${w.id}/workspace`)}
                />
                <ResultGroup
                  label="Workspace · Videos"
                  icon={VideoIcon}
                  items={results?.workspaceVideos ?? []}
                  render={(v) => v.title ?? 'Untitled video'}
                  onSelect={(v) => {
                    const wsId = resolveWorkspaceId(v.workSpaceId)
                    if (wsId) go(`/dashboard/${wsId}/video/${v.id}`)
                  }}
                />
                <ResultGroup
                  label="Workspace · Tasks"
                  icon={ClipboardList}
                  items={results?.workspaceTasks ?? []}
                  render={(t) => t.title}
                  meta={(t) => t.status.replace('_', ' ')}
                  onSelect={(t) =>
                    go(`/dashboard/${t.workSpaceId}/workspace`)
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ResultGroup<T extends { id: string }>({
  label,
  icon: Icon,
  items,
  render,
  meta,
  onSelect,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: T[]
  render: (item: T) => string
  meta?: (item: T) => string
  onSelect: (item: T) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-foreground">
              {render(item)}
            </span>
            {meta && (
              <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                {meta(item)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default React.memo(WorkspaceSearch)
