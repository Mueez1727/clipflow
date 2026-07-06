'use client'

import { generateVideoTranscript } from '@/actions/workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React, { useState, useTransition } from 'react'

type Props = {
  videoId: string
  videoSource: string
  transcript?: string | null
}

const CAPTURE_TIMEOUT_MS = 12_000
const MAX_FRAME_WIDTH = 960

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

    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }

    const cleanup = () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }

    const timer = setTimeout(() => {
      cleanup()
      finish(() => reject(new Error('Frame capture timed out')))
    }, CAPTURE_TIMEOUT_MS)

    video.addEventListener('loadeddata', () => {
      const targetTime =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(1, video.duration * 0.25)
          : 0
      video.currentTime = targetTime
    })

    video.addEventListener('seeked', () => {
      try {
        const sourceWidth = video.videoWidth || 1280
        const sourceHeight = video.videoHeight || 720
        const scale = Math.min(1, MAX_FRAME_WIDTH / sourceWidth)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(sourceWidth * scale)
        canvas.height = Math.round(sourceHeight * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanup()
          finish(() => reject(new Error('Could not capture frame')))
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72)
        cleanup()
        finish(() => resolve(dataUrl))
      } catch (error) {
        cleanup()
        finish(() => reject(error))
      }
    })

    video.addEventListener('error', () => {
      cleanup()
      finish(() => reject(new Error('Could not load video for frame capture')))
    })
  })
}

const VideoTranscript = ({ videoId, videoSource, transcript: initial }: Props) => {
  const [transcript, setTranscript] = useState(initial ?? '')
  const [notice, setNotice] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onGenerate = () => {
    setNotice(null)
    startTransition(async () => {
      try {
        let frameDataUrl: string
        try {
          frameDataUrl = await captureVideoFrame(videoSource)
        } catch {
          const message =
            'Could not capture a frame from this video. The video may still be processing, or your browser blocked frame access.'
          setTranscript('')
          setNotice(message)
          setIsFallback(true)
          return
        }

        const result = await generateVideoTranscript(videoId, frameDataUrl)
        const text =
          typeof result.data === 'string' ? result.data : ''

        if (text) {
          setTranscript(text)
          setIsFallback(Boolean(result.fallback))
          if (result.fallback) {
            setNotice('Visual description could not be fully generated. Showing a fallback message.')
          } else {
            setNotice(null)
          }
        } else {
          setTranscript('')
          setNotice(
            'We could not generate a visual description right now. Please try again later.'
          )
          setIsFallback(true)
        }
      } catch {
        setTranscript('')
        setNotice(
          'Something went wrong while generating the transcript. Please try again.'
        )
        setIsFallback(true)
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
        <>
          {notice && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              {notice}
            </p>
          )}
          <p
            className={cn(
              'whitespace-pre-wrap text-sm leading-relaxed',
              isFallback ? 'text-muted-foreground italic' : 'text-muted-foreground'
            )}
          >
            {transcript}
          </p>
        </>
      ) : notice ? (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {notice}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No transcript yet. Generate one from a snapshot of your video.
        </p>
      )}
    </div>
  )
}

export default React.memo(VideoTranscript)
