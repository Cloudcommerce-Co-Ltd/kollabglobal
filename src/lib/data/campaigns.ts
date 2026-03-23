import prisma from '@/lib/prisma';

export function getUserCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { userId },
    include: {
      country: true,
      package: true,
      product: true,
      creators: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
