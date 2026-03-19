import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/s3', () => ({
  isS3Configured: vi.fn(),
  generatePresignedUpload: vi.fn(),
}))

import { POST } from '../route'
import { auth } from '@/auth'
import { isS3Configured, generatePresignedUpload } from '@/lib/s3'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  filename: 'product-hero.jpg',
  contentType: 'image/jpeg',
  size: 1_000_000,
}

const MOCK_SESSION = { user: { id: 'user-1', email: 'brand@test.com' } }

const MOCK_PRESIGN_RESULT = {
  presignedUrl: 'https://kollabglobal-uploads.s3.ap-southeast-7.amazonaws.com/products/uuid.jpg?X-Amz-Signature=abc',
  objectUrl: 'https://kollabglobal-uploads.s3.ap-southeast-7.amazonaws.com/products/uuid.jpg',
  key: 'products/uuid.jpg',
}

describe('POST /api/upload/presign', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never)
    vi.mocked(isS3Configured).mockReturnValue(true)
    vi.mocked(generatePresignedUpload).mockResolvedValue(MOCK_PRESIGN_RESULT)
  })

  it('returns 200 with presignedUrl, objectUrl, key when S3 is configured', async () => {
    const res = await POST(makeRequest(VALID_BODY) as never)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual(MOCK_PRESIGN_RESULT)
  })

  it('returns 200 with mock:true when S3 is not configured', async () => {
    vi.mocked(isS3Configured).mockReturnValue(false)
    const res = await POST(makeRequest(VALID_BODY) as never)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ mock: true, presignedUrl: null, objectUrl: null, key: null })
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(makeRequest(VALID_BODY) as never)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })

  it('returns 400 when contentType is not allowed (image/gif)', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, contentType: 'image/gif' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when size exceeds 5 MB', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, size: 5_242_881 }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when size is 0', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, size: 0 }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when filename is missing', async () => {
    const { filename: _, ...rest } = VALID_BODY
    const res = await POST(makeRequest(rest) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when contentType is missing', async () => {
    const { contentType: _, ...rest } = VALID_BODY
    const res = await POST(makeRequest(rest) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when size is missing', async () => {
    const { size: _, ...rest } = VALID_BODY
    const res = await POST(makeRequest(rest) as never)
    expect(res.status).toBe(400)
  })

  it('returns 500 when generatePresignedUpload throws unexpectedly', async () => {
    vi.mocked(generatePresignedUpload).mockRejectedValue(new Error('AWS network error'))
    const res = await POST(makeRequest(VALID_BODY) as never)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Failed to generate upload URL')
  })

  it('folder passed to generatePresignedUpload is always products', async () => {
    await POST(makeRequest(VALID_BODY) as never)
    expect(vi.mocked(generatePresignedUpload)).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'products' })
    )
  })

  it('folder is never derived from request body', async () => {
    const bodyWithFolder = { ...VALID_BODY, folder: 'creators' }
    await POST(makeRequest(bodyWithFolder) as never)
    expect(vi.mocked(generatePresignedUpload)).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'products' })
    )
  })
})
