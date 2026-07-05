'use client'

import { setReviewStatus, togglePinVideo } from '@/actions/review'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { REVIEW_STATUS } from '@prisma/client'
import { useQueryClient } from '@tanstack/react-query'
import { Check, CircleDashed, Clock, Pin, RotateCcw, ShieldCheck } from 'lucide-react'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  workspaceId: string
  reviewStatus: REVIEW_STATUS
  pinned: boolean
}

const VideoReviewControls = ({
  videoId,
  workspaceId,
  reviewStatus,
  pinned,
}: Props) => {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['workspace-videos', workspaceId] })
    queryClient.invalidateQueries({
      queryKey: ['workspace-activity', workspaceId],
    })
  }

  const applyStatus = (status: REVIEW_STATUS, reviewNote?: string) => {
    startTransition(async () => {
      const res = await setReviewStatus(videoId, workspaceId, status, reviewNote)
      toast(res.status === 200 ? 'Success' : 'Error', { description: res.data })
      if (res.status === 200) {
        setNoteOpen(false)
        setNote('')
        refresh()
      }
    })
  }

  const pin = () => {
    startTransition(async () => {
      const res = await togglePinVideo(videoId, workspaceId)
      toast(res.status === 200 ? 'Success' : 'Error', { description: res.data })
      if (res.status === 200) refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          pin()
        }}
        disabled={isPending}
        title={pinned ? 'Unpin video' : 'Pin video'}
        className={cn(
          'flex h-5 items-center justify-center rounded p-[5px] transition-colors',
          pinned
            ? 'bg-[#7C3AED] text-white shadow-sm'
            : 'border border-border/80 bg-background/95 text-foreground shadow-sm hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] dark:bg-card/95'
        )}
      >
        <Pin className="h-3 w-3" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            title="Review"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background/95 text-foreground shadow-sm transition-colors hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] dark:bg-card/95"
          >
            <ShieldCheck className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={() => applyStatus('APPROVED')}
            className="text-emerald-600 focus:text-emerald-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
            {reviewStatus === 'APPROVED' && (
              <Check className="ml-auto h-3.5 w-3.5" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setNoteOpen(true)}
            className="text-amber-600 focus:text-amber-600"
          >
            <CircleDashed className="mr-2 h-4 w-4" />
            Request Changes
            {reviewStatus === 'NEEDS_CHANGES' && (
              <Check className="ml-auto h-3.5 w-3.5" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => applyStatus('PENDING')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Mark Pending
            {reviewStatus === 'PENDING' && (
              <Check className="ml-auto h-3.5 w-3.5" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Request Changes
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Let the creator know what needs to change. A comment is required.
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please trim the intro and fix the audio at 1:20"
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyStatus('NEEDS_CHANGES', note)}
              disabled={!note.trim() || isPending}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VideoReviewControls
