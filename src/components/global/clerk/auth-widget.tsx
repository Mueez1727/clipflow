'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import React from 'react'

type Props = {
  mode: 'sign-in' | 'sign-up'
}

const AuthWidget = ({ mode }: Props) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  const appearance = {
    variables: {
      colorPrimary: '#7C3AED',
      borderRadius: '0.75rem',
      colorBackground: 'transparent',
      colorText: isDark ? '#f5f5f5' : '#1f2937',
      colorTextSecondary: isDark ? '#a3a3a3' : '#6b7280',
      colorInputBackground: isDark ? '#1a1c22' : '#ffffff',
      colorInputText: isDark ? '#f5f5f5' : '#1f2937',
      colorNeutral: isDark ? '#f5f5f5' : '#1f2937',
    },
    elements: {
      rootBox: 'w-full',
      cardBox: 'w-full shadow-none',
      card: 'w-full bg-transparent shadow-none border-0 px-6 py-6 gap-6',
      headerTitle: 'text-foreground text-xl',
      headerSubtitle: 'text-muted-foreground',
      socialButtonsBlockButton:
        '!border !border-border !bg-card !text-foreground hover:!bg-accent transition-colors',
      socialButtonsBlockButtonText: '!text-foreground font-medium',
      socialButtonsProviderIcon: 'opacity-100',
      dividerLine: 'bg-border',
      dividerText: 'text-muted-foreground',
      formFieldLabel: 'text-foreground',
      formFieldInput:
        '!bg-background !border-border !text-foreground focus:!border-[#7C3AED]',
      formButtonPrimary:
        'btn-clipflow !shadow-md normal-case text-sm font-medium',
      formFieldInputShowPasswordButton: 'text-muted-foreground',
      footer: 'bg-transparent',
      footerActionText: 'text-muted-foreground',
      footerActionLink: 'text-[#7C3AED] hover:text-[#6d28d9]',
      identityPreviewText: 'text-foreground',
      identityPreviewEditButton: 'text-[#7C3AED]',
      formResendCodeLink: 'text-[#7C3AED]',
      otpCodeFieldInput: '!text-foreground !border-border',
    },
  }

  if (mode === 'sign-in') {
    return <SignIn appearance={appearance} />
  }
  return <SignUp appearance={appearance} />
}

export default AuthWidget
