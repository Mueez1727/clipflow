import { client } from '@/lib/prisma'
import { getOrCreatePersonalStorage } from '@/lib/personal-library'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { id } = params

    const dbUser = await client.user.findUnique({
      where: { id },
      select: { id: true, firstname: true },
    })
    if (!dbUser) {
      return NextResponse.json({ status: 400, message: 'User not found' })
    }

    const workspaceId = await getOrCreatePersonalStorage(
      dbUser.id,
      dbUser.firstname
    )

    const startProcessingVideo = await client.workSpace.update({
      where: {
        id: workspaceId,
      },
      data: {
        videos: {
          create: {
            source: body.filename,
            userId: id,
          },
        },
      },
      select: {
        User: {
          select: {
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (startProcessingVideo) {
      return NextResponse.json({
        status: 200,
        plan: startProcessingVideo.User?.subscription?.plan,
      })
    }
    return NextResponse.json({ status: 400 })
  } catch (error) {
    console.log('🔴 Error in processing video', error)
    return NextResponse.json({ status: 500 })
  }
}
