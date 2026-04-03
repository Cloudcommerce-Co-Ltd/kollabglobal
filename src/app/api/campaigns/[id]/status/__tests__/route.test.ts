import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: {
    campaign: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    campaignStatusLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));

import { PATCH } from '../route';

describe('PATCH /api/campaigns/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a status log entry on valid transition', async () => {
    const mockCampaign = { id: 'camp-1', userId: 'user-1', status: 'PENDING' };
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as never);
    vi.mocked(prisma.$transaction).mockImplementation(
      async (fn: unknown) => (fn as (tx: typeof prisma) => Promise<unknown>)(prisma)
    );
    vi.mocked(prisma.campaign.update).mockResolvedValue({ ...mockCampaign, status: 'ACCEPTING' } as never);
    vi.mocked(prisma.campaignStatusLog.create).mockResolvedValue({} as never);

    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTING' }),
    });
    const res = await PATCH(req as never, { params: Promise.resolve({ id: 'camp-1' }) });

    expect(res.status).toBe(200);
    expect(prisma.campaignStatusLog.create).toHaveBeenCalledWith({
      data: {
        campaignId: 'camp-1',
        fromStatus: 'PENDING',
        toStatus: 'ACCEPTING',
        changedBy: 'user-1',
      },
    });
  });

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTING' }),
    });
    const res = await PATCH(req as never, { params: Promise.resolve({ id: 'camp-1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when campaign not found', async () => {
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(null);

    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTING' }),
    });
    const res = await PATCH(req as never, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});
