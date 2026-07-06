'use client'

import { useUser } from '@clerk/nextjs'
import React, { createContext, useContext, useMemo } from 'react'

type ClerkUserContextValue = ReturnType<typeof useUser>

const ClerkUserContext = createContext<ClerkUserContextValue | null>(null)

export const ClerkUserProvider = ({ children }: { children: React.ReactNode }) => {
  const clerkUser = useUser()

  const value = useMemo(
    () => clerkUser,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-render when identity fields change
    [
      clerkUser.isLoaded,
      clerkUser.isSignedIn,
      clerkUser.user?.id,
      clerkUser.user?.fullName,
      clerkUser.user?.firstName,
      clerkUser.user?.imageUrl,
    ]
  )

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
