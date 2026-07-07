'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { clipflowAuthWidgetAppearance } from '@/lib/clerk-appearance'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import React from 'react'

const WEB_AUTH_CALLBACK = '/auth/callback'

type Props = {
  mode: 'sign-in' | 'sign-up'
}

const isRootAuthRoute = (pathname: string | null) =>
  pathname === '/sign-in' ||
  pathname?.startsWith('/sign-in/') ||
  pathname === '/sign-up' ||
  pathname?.startsWith('/sign-up/')

const AuthWidget = ({ mode }: Props) => {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  const useRootAuthRoutes = isRootAuthRoute(pathname)

  const signInUrl = useRootAuthRoutes ? '/sign-in' : '/auth/sign-in'
  const signUpUrl = useRootAuthRoutes ? '/sign-up' : '/auth/sign-up'

  const isDark = resolvedTheme !== 'light'
  const appearance = clipflowAuthWidgetAppearance(isDark)

  const sharedProps = {
    appearance,
    // Preserve redirect_url (e.g. clipflow://auth/callback for desktop OAuth).
    // fallbackRedirectUrl is only used when no redirect_url query param is present.
    fallbackRedirectUrl: WEB_AUTH_CALLBACK,
    signInUrl,
    signUpUrl,
    signInFallbackRedirectUrl: WEB_AUTH_CALLBACK,
    signUpFallbackRedirectUrl: WEB_AUTH_CALLBACK,
  }

  if (mode === 'sign-in') {
    return <SignIn {...sharedProps} />
  }

  return <SignUp {...sharedProps} />
}

export default AuthWidget
