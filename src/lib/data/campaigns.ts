import prisma from '@/lib/prisma';
import type { CampaignListItem } from '@/types/campaign';

export function getUserCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { userId, status: { not: 'DRAFT' } },
    include: {
      country: true,
      package: true,
      products: true,
      creators: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export function getCampaignDetail(userId: string, id: string) {
  return prisma.campaign.findFirst({
    where: { id, userId },
    include: {
      country: true,
      package: true,
      products: true,
      brief: true,
      creators: { include: { creator: true } },
    },
  });
}

export function mapToListItem(c: Awaited<ReturnType<typeof getUserCampaigns>>[number]): CampaignListItem {
  return {
    id: c.id,
    promotionType: c.promotionType,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    country: c.country
      ? { id: c.country.id, name: c.country.name, countryCode: c.country.countryCode }
      : null,
    package: c.package
      ? { id: c.package.id, name: c.package.name, numCreators: c.package.numCreators, platforms: c.package.platforms }
      : null,
    product: c.products[0]
      ? {
          brandName: c.products[0].brandName,
          productName: c.products[0].productName,
          isService: c.products[0].isService,
          imageUrl: c.products[0].imageUrl,
        }
      : null,
    creators: c.creators.map(cr => ({ status: cr.status })),
  };
}
