'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { clipflowAuthWidgetAppearance } from '@/lib/clerk-appearance'
import { useTheme } from 'next-themes'
import React from 'react'

type Props = {
  mode: 'sign-in' | 'sign-up'
}

const AuthWidget = ({ mode }: Props) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'
  const appearance = clipflowAuthWidgetAppearance(isDark)

  if (mode === 'sign-in') {
    return (
      <SignIn
        appearance={appearance}
        forceRedirectUrl="/auth/callback"
        signUpUrl="/auth/sign-up"
      />
    )
  }
  return (
    <SignUp
      appearance={appearance}
      forceRedirectUrl="/auth/callback"
      signInUrl="/auth/sign-in"
    />
  )
}

export default AuthWidget
