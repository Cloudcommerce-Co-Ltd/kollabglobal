import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserCampaigns, getCampaignDetail, mapToListItem } from '../campaigns';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      campaign: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  };
});

describe('campaigns data access', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserCampaigns', () => {
    it('calls prisma with correct query', async () => {
      (prisma.campaign.findMany as any).mockResolvedValue(['mock-campaign']);
      const res = await getUserCampaigns('user-1');
      expect(prisma.campaign.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: { not: 'DRAFT' } },
        include: {
          country: true,
          package: true,
          products: true,
          creators: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toEqual(['mock-campaign']);
    });
  });

  describe('getCampaignDetail', () => {
    it('calls prisma with correct query', async () => {
      (prisma.campaign.findFirst as any).mockResolvedValue('mock-detail');
      const res = await getCampaignDetail('user-1', 'camp-1');
      expect(prisma.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: 'camp-1', userId: 'user-1' },
        include: {
          country: true,
          package: true,
          products: true,
          brief: true,
          creators: { include: { creator: true } },
        },
      });
      expect(res).toBe('mock-detail');
    });
  });

  describe('mapToListItem', () => {
    const mockDate = new Date('2026-06-01T10:00:00.000Z');

    it('maps full entity correctly', () => {
      const entity = {
        id: 'camp-2',
        promotionType: 'PRODUCT',
        status: 'PENDING',
        createdAt: mockDate,
        country: { id: 1, name: 'Thailand', countryCode: 'TH' },
        package: { id: 2, name: 'Pack A', numCreators: 10, platforms: ['tiktok'] },
        products: [{ brandName: 'BrandX', productName: 'ProdY', isService: false, imageUrl: 'img.jpg' }],
        creators: [{ status: 'PENDING' }, { status: 'ACCEPTED' }],
      } as any;

      const result = mapToListItem(entity);
      expect(result).toEqual({ // Verify exact mapping
        id: 'camp-2',
        promotionType: 'PRODUCT',
        status: 'PENDING',
        createdAt: '2026-06-01T10:00:00.000Z',
        country: { id: 1, name: 'Thailand', countryCode: 'TH' },
        package: { id: 2, name: 'Pack A', numCreators: 10, platforms: ['tiktok'] },
        product: { brandName: 'BrandX', productName: 'ProdY', isService: false, imageUrl: 'img.jpg' },
        creators: [{ status: 'PENDING' }, { status: 'ACCEPTED' }],
      });
    });

    it('maps fields with nulls correctly', () => {
      const entity = {
        id: 'camp-3',
        promotionType: 'SERVICE',
        status: 'ACTIVE',
        createdAt: mockDate,
        country: null,
        package: null,
        products: [],
        creators: [],
      } as any;

      const result = mapToListItem(entity);
      expect(result).toEqual({ // Verify exact mapping
        id: 'camp-3',
        promotionType: 'SERVICE',
        status: 'ACTIVE',
        createdAt: '2026-06-01T10:00:00.000Z',
        country: null,
        package: null,
        product: null,
        creators: [],
      });
    });
  });
});
