import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserCampaigns } from '@/lib/data/campaigns';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { CampaignDashboard } from '@/components/campaigns/campaign-dashboard';
import type { CampaignListItem } from '@/types/campaign';

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const rawCampaigns = await getUserCampaigns(session.user.id);

  // Serialize dates so they are safe to pass to client components
  const campaigns: CampaignListItem[] = rawCampaigns.map((c) => ({
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
    product: c.product
      ? {
          brandName: c.product.brandName,
          productName: c.product.productName,
          isService: c.product.isService,
          imageUrl: c.product.imageUrl,
        }
      : null,
    creators: c.creators.map((cr) => ({ status: cr.status })),
  }));

  return (
    <>
      <DashboardHeader user={session.user} />
      <CampaignDashboard campaigns={campaigns} />
    </>
  );
}
