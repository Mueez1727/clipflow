'use client'

import { updateVideoTags } from '@/actions/workspace'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, X } from 'lucide-react'
import React, { useCallback, useState, useTransition } from 'react'

type Props = {
  videoId: string
  tags: string[]
  editable?: boolean
}

const VideoTags = ({ videoId, tags: initialTags, editable = false }: Props) => {
  const queryClient = useQueryClient()
  const [tags, setTags] = useState(initialTags)
  const [draft, setDraft] = useState('')
  const [isPending, startTransition] = useTransition()

  const persist = useCallback(
    (next: string[]) => {
      setTags(next)
      startTransition(async () => {
        const result = await updateVideoTags(videoId, next)
        if (result.status === 200 && Array.isArray(result.data)) {
          setTags(result.data)
          queryClient.invalidateQueries({ queryKey: ['preview-video'] })
        }
      })
    },
    [queryClient, videoId]
  )

  const addTag = () => {
    const value = draft.trim()
    if (!value || tags.includes(value)) return
    setDraft('')
    persist([...tags, value])
  }

  const removeTag = (tag: string) => {
    persist(tags.filter((t) => t !== tag))
  }

  if (!editable && tags.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground">Tags</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 rounded-full px-3 py-1 text-xs"
          >
            {tag}
            {editable && (
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
                className="rounded-full hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}
      </div>
      {editable && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Add a tag"
            className="h-9"
            disabled={isPending}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addTag}
            disabled={isPending || !draft.trim()}
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default React.memo(VideoTags)
