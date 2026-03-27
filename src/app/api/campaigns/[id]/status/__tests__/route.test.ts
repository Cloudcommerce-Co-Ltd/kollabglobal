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
    vi.mocked(prisma.campaign.findFirst).mockResolvedValue(mockCampaign as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(prisma));
    vi.mocked(prisma.campaign.update).mockResolvedValue({ ...mockCampaign, status: 'ACCEPTING' } as any);
    vi.mocked(prisma.campaignStatusLog.create).mockResolvedValue({} as any);

    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTING' }),
    });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: 'camp-1' }) });

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
});
