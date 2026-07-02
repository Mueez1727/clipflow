import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { id } = params

    const existing = await client.video.findFirst({
      where: { source: body.filename, userId: id },
    })
    if (!existing) {
      return NextResponse.json({ status: 404 })
    }

    const content = JSON.parse(body.content)

    const transcribed = await client.video.update({
      where: {
        source: body.filename,
      },
      data: {
        title: content.title,
        description: content.summary,
        summary: body.transcript,
      },
    })

    if (transcribed) {
      return NextResponse.json({ status: 200 })
    }

    return NextResponse.json({ status: 400 })
  } catch (error) {
    console.log('Error in transcribe route', error)
    return NextResponse.json({ status: 500 })
  }
}
