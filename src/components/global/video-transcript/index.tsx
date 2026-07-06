'use client'

import { generateVideoTranscript } from '@/actions/workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  videoSource: string
  transcript?: string | null
}

const captureVideoFrame = (source: string): Promise<string> => {
  const streamBase = process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL
  if (!streamBase) {
    return Promise.reject(new Error('Video stream URL is not configured'))
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = `${streamBase}/${source}`

    const cleanup = () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }

    video.addEventListener('loadeddata', () => {
      const targetTime =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(1, video.duration * 0.25)
          : 0
      video.currentTime = targetTime
    })

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanup()
          reject(new Error('Could not capture frame'))
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        cleanup()
        resolve(dataUrl)
      } catch (error) {
        cleanup()
        reject(error)
      }
    })

    video.addEventListener('error', () => {
      cleanup()
      reject(new Error('Could not load video for frame capture'))
    })
  })
}

const VideoTranscript = ({ videoId, videoSource, transcript: initial }: Props) => {
  const [transcript, setTranscript] = useState(initial ?? '')
  const [isPending, startTransition] = useTransition()

  const onGenerate = () => {
    startTransition(async () => {
      try {
        const frameDataUrl = await captureVideoFrame(videoSource)
        const result = await generateVideoTranscript(videoId, frameDataUrl)
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
      } catch {
        toast.error('Could not capture a frame from this video')
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
          No transcript yet. Generate one from a snapshot of your video.
        </p>
      )}
    </div>
  )
}

export default VideoTranscript
