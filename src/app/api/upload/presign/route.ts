import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isS3Configured, generatePresignedUpload } from '@/lib/s3'

const BodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().min(1).max(5_242_880),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!isS3Configured()) {
    return NextResponse.json({
      mock: true,
      presignedUrl: null,
      objectUrl: null,
      key: null,
    })
  }

  try {
    const result = await generatePresignedUpload({
      folder: 'products',
      contentType: parsed.data.contentType,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
