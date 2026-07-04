'use client'

import { searchWorkspace } from '@/actions/workspace-search'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  MessageCircle,
  MessageSquare,
  Search,
  Users,
  Video as VideoIcon,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

type SearchResults = {
  videos: { id: string; title: string | null }[]
  tasks: {
    id: string
    title: string
    status: string
    priority: string
  }[]
  comments: {
    id: string
    content: string
    videoId: string
    User: { firstname: string | null; lastname: string | null } | null
  }[]
  members: {
    id: string
    firstname: string | null
    lastname: string | null
    email: string
  }[]
  messages: {
    id: string
    content: string
    User: { firstname: string | null; lastname: string | null } | null
  }[]
}

const WorkspaceSearch = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250)
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
    queryKey: ['workspace-search', workspaceId, debounced],
    queryFn: () => searchWorkspace(workspaceId, debounced),
    enabled: open && debounced.length > 0,
  })

  const results = (data as { data: SearchResults } | undefined)?.data
  const total = useMemo(() => {
    if (!results) return 0
    return (
      results.videos.length +
      results.tasks.length +
      results.comments.length +
      results.members.length +
      results.messages.length
    )
  }, [results])

  const go = (path: string) => {
    setOpen(false)
    setTerm('')
    router.push(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-lg items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:border-[#7C3AED]/40"
      >
        <Search size={18} className="shrink-0" />
        <span className="flex-1 text-left">Search this workspace...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Workspace search</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search videos, tasks, comments, members, messages..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isFetching && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {debounced.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Start typing to search across the workspace.
              </p>
            ) : total === 0 && !isFetching ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No results for &quot;{debounced}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                <ResultGroup
                  label="Videos"
                  icon={VideoIcon}
                  items={results?.videos ?? []}
                  render={(v) => v.title ?? 'Untitled video'}
                  onSelect={(v) =>
                    go(`/dashboard/${workspaceId}/video/${v.id}`)
                  }
                />
                <ResultGroup
                  label="Tasks"
                  icon={ClipboardList}
                  items={results?.tasks ?? []}
                  render={(t) => t.title}
                  meta={(t) => t.priority}
                  onSelect={() => go(`/dashboard/${workspaceId}/workspace`)}
                />
                <ResultGroup
                  label="Comments"
                  icon={MessageSquare}
                  items={results?.comments ?? []}
                  render={(c) => c.content}
                  onSelect={(c) =>
                    go(`/dashboard/${workspaceId}/video/${c.videoId}`)
                  }
                />
                <ResultGroup
                  label="Members"
                  icon={Users}
                  items={results?.members ?? []}
                  render={(m) =>
                    `${m.firstname ?? ''} ${m.lastname ?? ''}`.trim() || m.email
                  }
                  onSelect={() => go(`/dashboard/${workspaceId}/workspace`)}
                />
                <ResultGroup
                  label="Messages"
                  icon={MessageCircle}
                  items={results?.messages ?? []}
                  render={(m) => m.content}
                  onSelect={() => go(`/dashboard/${workspaceId}/workspace`)}
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

export default WorkspaceSearch
