'use client'

import { generateVideoTranscript } from '@/actions/workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  transcript?: string | null
}

const VideoTranscript = ({ videoId, transcript: initial }: Props) => {
  const [transcript, setTranscript] = useState(initial ?? '')
  const [isPending, startTransition] = useTransition()

  const onGenerate = () => {
    startTransition(async () => {
      const result = await generateVideoTranscript(videoId)
      if (result.status === 200 && result.data) {
        setTranscript(result.data)
        toast.success('Transcript generated')
      } else {
        toast.error(
          typeof result.data === 'string'
            ? result.data
            : 'Could not generate transcript'
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={onGenerate}
          className="shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : transcript ? (
            'Regenerate'
          ) : (
            'Generate Transcript'
          )}
        </Button>
      </div>

      {isPending && !transcript ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : transcript ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {transcript}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No transcript yet. Click generate to create one from your video audio.
        </p>
      )}
    </div>
  )
}

export default VideoTranscript
