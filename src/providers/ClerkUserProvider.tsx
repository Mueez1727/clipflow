'use client'

import { useUser } from '@clerk/nextjs'
import React, { createContext, useContext, useMemo } from 'react'

type ClerkUserContextValue = ReturnType<typeof useUser>

const ClerkUserContext = createContext<ClerkUserContextValue | null>(null)

export const ClerkUserProvider = ({ children }: { children: React.ReactNode }) => {
  const clerkUser = useUser()

  const value = useMemo(() => clerkUser, [clerkUser])

  return (
    <ClerkUserContext.Provider value={value}>{children}</ClerkUserContext.Provider>
  )
}

export const useClerkUser = () => {
  const context = useContext(ClerkUserContext)
  if (!context) {
    throw new Error('useClerkUser must be used within ClerkUserProvider')
  }
  return context
}
