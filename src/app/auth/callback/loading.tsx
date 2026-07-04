'use client'

import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const STEPS = [
  'Authenticating',
  'Loading Dashboard',
  'Preparing Workspace',
  'Fetching User Data',
]

const AuthLoading = () => {
  const [progress, setProgress] = useState(10)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 96 ? 96 : prev + Math.random() * 5 + 2))
    }, 280)

    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 900)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 text-radial opacity-70" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6">
        <div className="text-center">
          <p className="text-2xl font-bold clipflow-gradient-text">ClipFlow</p>
          <p className="mt-1 text-sm text-muted-foreground">Setting up your workspace</p>
        </div>

        <div className="w-full space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full clipflow-gradient transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="space-y-3">
            {STEPS.map((label, index) => {
              const done = index < step
              const active = index === step
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 text-sm transition-colors duration-300"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : active
                        ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                        : 'border-border'
                    }`}
                  >
                    {done ? (
                      <Check className="h-3 w-3" />
                    ) : active ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#7C3AED]" />
                    ) : null}
                  </span>
                  <span
                    className={
                      done || active ? 'text-foreground' : 'text-muted-foreground'
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

export default AuthLoading
