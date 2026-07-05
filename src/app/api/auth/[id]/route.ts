export const dynamic = "force-dynamic";

import { client } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  console.log('[auth] GET /api/auth/', id)

  try {
    const userProfile = await client.user.findUnique({
      where: {
        clerkid: id,
      },
      include: {
        studio: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (userProfile) {
      console.log('[auth] user found in DB:', userProfile.id)
      return NextResponse.json({ status: 200, user: userProfile })
    }

    console.log('[auth] user not in DB, fetching from Clerk')
    const clerk = await clerkClient()
    const clerkUserInstance = await clerk.users.getUser(id)

    const primaryEmail = clerkUserInstance.emailAddresses[0]?.emailAddress
    if (!primaryEmail) {
      return NextResponse.json(
        { status: 400, message: 'Clerk user has no email address' },
        { status: 400 }
      )
    }

    const createUser = await client.user.create({
      data: {
        clerkid: id,
        email: primaryEmail,
        firstname: clerkUserInstance.firstName || '',
        lastname: clerkUserInstance.lastName || '',
        studio: {
          create: {},
        },
        subscription: {
          create: {},
        },
      },
      include: {
        studio: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })

    console.log('[auth] user created in DB:', createUser.id)
    return NextResponse.json({ status: 201, user: createUser }, { status: 201 })
  } catch (error) {
    console.error('[auth] FAILED at:', error)

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          status: 503,
          message:
            'Database unreachable. Check DATABASE_URL and ensure Neon project is active.',
        },
        { status: 503 }
      )
    }

    if (
      error &&
      typeof error === 'object' &&
      'clerkError' in error &&
      (error as { status?: number }).status === 404
    ) {
      return NextResponse.json(
        { status: 404, message: 'Clerk user not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
