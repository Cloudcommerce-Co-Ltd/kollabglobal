import prisma from '@/lib/prisma';

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
