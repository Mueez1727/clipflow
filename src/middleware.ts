import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const getAllowedOrigins = (requestOrigin: string, requestUrlOrigin: string) => {
  const envOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  const configuredHost = process.env.NEXT_PUBLIC_HOST_URL?.trim()

  return Array.from(
    new Set([requestOrigin, requestUrlOrigin, configuredHost, ...envOrigins].filter(Boolean))
  )
}

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const isProtectedRoutes = createRouteMatcher(['/dashboard(.*)', '/payment(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigins = getAllowedOrigins(origin, req.nextUrl.origin)
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  // Handle protected routes
  const { userId } = await auth()

  if (isProtectedRoutes(req) && !userId) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // Handle simple requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}