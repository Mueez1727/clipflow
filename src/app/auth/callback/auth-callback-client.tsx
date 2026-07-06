'use client'

import { completeAuthCallback } from '@/actions/user'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const STEPS = [
  'Authenticating',
  'Loading Dashboard',
  'Syncing Profile',
  'Fetching User Data',
]

const STEP_MS = 700
const FINISH_DELAY_MS = 400

const AuthCallbackClient = () => {
  const router = useRouter()
  const [progress, setProgress] = useState(5)
  const [step, setStep] = useState(0)
  const [allComplete, setAllComplete] = useState(false)
  const redirectRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let progressTimer: ReturnType<typeof setInterval> | undefined

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
      })

    const run = async () => {
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return prev
          return prev + 1.2
        })
      }, 120)

      const result = await completeAuthCallback()
      if (cancelled) return

      redirectRef.current = result.redirectTo

      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return
        setStep(i)
        await sleep(STEP_MS)
      }

      if (cancelled) return

      setStep(STEPS.length)
      setAllComplete(true)

      if (progressTimer) clearInterval(progressTimer)

      const start = performance.now()
      const animateToFull = () => {
        if (cancelled) return
        const elapsed = performance.now() - start
        const t = Math.min(elapsed / 600, 1)
        setProgress(88 + t * 12)
        if (t < 1) {
          requestAnimationFrame(animateToFull)
        } else {
          setProgress(100)
        }
      }
      requestAnimationFrame(animateToFull)

      await sleep(650)
      await sleep(FINISH_DELAY_MS)

      if (!cancelled && redirectRef.current) {
        router.replace(redirectRef.current)
      }
    }

    run()

    return () => {
      cancelled = true
      if (progressTimer) clearInterval(progressTimer)
    }
  }, [router])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 text-radial opacity-70" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6">
        <div className="text-center">
          <p className="text-2xl font-bold clipflow-gradient-text">ClipFlow</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Setting up your account
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full clipflow-gradient transition-[width] duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="space-y-3">
            {STEPS.map((label, index) => {
              const stepDone = allComplete || index < step
              const active = !allComplete && index === step
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 text-sm transition-colors duration-300"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      stepDone
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : active
                          ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                          : 'border-border'
                    }`}
                  >
                    {stepDone ? (
                      <Check className="h-3 w-3" />
                    ) : active ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#7C3AED]" />
                    ) : null}
                  </span>
                  <span
                    className={
                      stepDone || active
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackClient
