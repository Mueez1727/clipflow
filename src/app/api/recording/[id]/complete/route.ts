import { applyVideoMetadataOnComplete } from '@/lib/server/apply-video-metadata'
import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { id } = params

  const existing = await client.video.findFirst({
    where: { source: body.filename, userId: id },
  })
  if (!existing) {
    return NextResponse.json({ status: 404 })
  }

  const completeProcessing = await applyVideoMetadataOnComplete(body.filename)
  if (completeProcessing) {
    return NextResponse.json({ status: 200 })
  }

  return NextResponse.json({ status: 400 })
}
