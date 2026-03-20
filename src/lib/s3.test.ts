import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  S3Client: vi.fn(function () {}),
  PutObjectCommand: vi.fn(function (input: unknown) { return input }),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-presigned.s3.amazonaws.com/products/uuid.jpg?X-Amz-Signature=test'),
}))

import { isS3Configured, generatePresignedUpload } from '@/lib/s3'

const ALL_VARS = {
  AWS_ACCESS_KEY_ID: 'AKIATEST123',
  AWS_SECRET_ACCESS_KEY: 'secrettest456',
  AWS_S3_BUCKET: 'kollab-global',
  AWS_S3_REGION: 'ap-southeast-1',
}

afterEach(() => {
  for (const k of Object.keys(ALL_VARS)) delete process.env[k]
})

describe('isS3Configured', () => {
  beforeEach(() => {
    for (const k of Object.keys(ALL_VARS)) delete process.env[k]
  })

  it('returns false when no vars are set', () => {
    expect(isS3Configured()).toBe(false)
  })

  it('returns false when only AWS_ACCESS_KEY_ID and AWS_S3_BUCKET are set', () => {
    process.env.AWS_ACCESS_KEY_ID = ALL_VARS.AWS_ACCESS_KEY_ID
    process.env.AWS_S3_BUCKET = ALL_VARS.AWS_S3_BUCKET
    expect(isS3Configured()).toBe(false)
  })

  it('returns false when AWS_SECRET_ACCESS_KEY is missing', () => {
    const { AWS_SECRET_ACCESS_KEY: _, ...rest } = ALL_VARS
    Object.assign(process.env, rest)
    expect(isS3Configured()).toBe(false)
  })

  it('returns false when AWS_S3_REGION is missing', () => {
    const { AWS_S3_REGION: _, ...rest } = ALL_VARS
    Object.assign(process.env, rest)
    expect(isS3Configured()).toBe(false)
  })

  it('returns true when all four vars are present', () => {
    Object.assign(process.env, ALL_VARS)
    expect(isS3Configured()).toBe(true)
  })
})

describe('generatePresignedUpload', () => {
  beforeEach(() => {
    Object.assign(process.env, ALL_VARS)
  })

  it('returns presignedUrl, objectUrl, and key', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/jpeg' })
    expect(result).toHaveProperty('presignedUrl')
    expect(result).toHaveProperty('objectUrl')
    expect(result).toHaveProperty('key')
    expect(typeof result.presignedUrl).toBe('string')
    expect(typeof result.objectUrl).toBe('string')
    expect(typeof result.key).toBe('string')
  })

  it('key starts with the folder prefix', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/jpeg' })
    expect(result.key).toMatch(/^products\//)
  })

  it('key ends with .jpg for image/jpeg', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/jpeg' })
    expect(result.key).toMatch(/\.jpg$/)
  })

  it('key ends with .png for image/png', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/png' })
    expect(result.key).toMatch(/\.png$/)
  })

  it('key ends with .webp for image/webp', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/webp' })
    expect(result.key).toMatch(/\.webp$/)
  })

  it('objectUrl is the correct permanent S3 URL', async () => {
    const result = await generatePresignedUpload({ folder: 'products', contentType: 'image/jpeg' })
    expect(result.objectUrl).toBe(
      `https://kollab-global.s3.ap-southeast-1.amazonaws.com/${result.key}`
    )
  })

  it('works with folder: creators', async () => {
    const result = await generatePresignedUpload({ folder: 'creators', contentType: 'image/jpeg' })
    expect(result.key).toMatch(/^creators\//)
  })

  it('throws when called unconfigured', async () => {
    for (const k of Object.keys(ALL_VARS)) delete process.env[k]
    await expect(
      generatePresignedUpload({ folder: 'products', contentType: 'image/jpeg' })
    ).rejects.toThrow('S3 is not configured')
  })

  it('throws when folder is not in the allowlist', async () => {
    await expect(
      // @ts-expect-error testing invalid folder
      generatePresignedUpload({ folder: 'avatars', contentType: 'image/jpeg' })
    ).rejects.toThrow('Invalid folder')
  })
})
