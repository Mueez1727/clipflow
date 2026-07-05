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

const STEP_MS = 750

const AuthCallbackClient = () => {
  const router = useRouter()
  const [progress, setProgress] = useState(8)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const redirectRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let progressTimer: ReturnType<typeof setInterval> | undefined
    let stepTimer: ReturnType<typeof setInterval> | undefined

    const run = async () => {
      const authPromise = completeAuthCallback()

      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (done) return 100
          return prev >= 92 ? 92 : prev + Math.random() * 4 + 1.5
        })
      }, 220)

      stepTimer = setInterval(() => {
        setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
      }, STEP_MS)

      const result = await authPromise
      if (cancelled) return

      redirectRef.current = result.redirectTo

      for (let i = step; i < STEPS.length; i++) {
        if (cancelled) return
        setStep(i)
        await new Promise((r) => setTimeout(r, STEP_MS))
      }

      setDone(true)
      setProgress(100)
      await new Promise((r) => setTimeout(r, 450))

      if (!cancelled && redirectRef.current) {
        router.replace(redirectRef.current)
      }
    }

    run()

    return () => {
      cancelled = true
      if (progressTimer) clearInterval(progressTimer)
      if (stepTimer) clearInterval(stepTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              className="h-full rounded-full clipflow-gradient transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="space-y-3">
            {STEPS.map((label, index) => {
              const stepDone = done || index < step
              const active = !done && index === step
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
