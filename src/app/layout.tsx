import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'
import { ThemeProvider } from '@/components/theme'
import ReactQueryProvider from '@/react-query'
import { ReduxProvider } from '@/redux/provider'
import { SocketProvider } from '@/providers/SocketProvider'
import { ClerkUserProvider } from '@/providers/ClerkUserProvider'
import {
  clipflowClerkAppearance,
  clipflowClerkLocalization,
} from '@/lib/clerk-appearance'
import { Toaster } from 'sonner'

const manrope = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClipFlow',
  description:
    'Record, upload, share, and collaborate with ClipFlow — modern screen recording and video workspace platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={clipflowClerkAppearance}
      localization={clipflowClerkLocalization}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${manrope.className} antialiased`}>
          <ClerkUserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              storageKey="clipflow-theme"
            >
              <ReduxProvider>
                <ReactQueryProvider>
                  <SocketProvider>
                    {children}
                    <Toaster />
                  </SocketProvider>
                </ReactQueryProvider>
              </ReduxProvider>
            </ThemeProvider>
          </ClerkUserProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}