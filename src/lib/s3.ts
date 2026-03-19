import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const ALLOWED_FOLDERS = ['products', 'creators'] as const
type Folder = (typeof ALLOWED_FOLDERS)[number]

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const isS3Configured = (): boolean =>
  !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_S3_REGION
  )

export async function generatePresignedUpload(opts: {
  folder: Folder
  contentType: string
}): Promise<{ presignedUrl: string; objectUrl: string; key: string }> {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured')
  }

  if (!(ALLOWED_FOLDERS as readonly string[]).includes(opts.folder)) {
    throw new Error(`Invalid folder: ${opts.folder}`)
  }

  const bucket = process.env.AWS_S3_BUCKET!
  const region = process.env.AWS_S3_REGION!

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const ext = EXT_MAP[opts.contentType] ?? 'bin'
  const key = `${opts.folder}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: opts.contentType,
  })

  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 60 })
  const objectUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

  return { presignedUrl, objectUrl, key }
}
