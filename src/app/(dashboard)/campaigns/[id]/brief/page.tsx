import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getCampaignDetail } from '@/lib/data/campaigns';
import { BriefView } from './_components/brief-view';

export default async function CampaignBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const campaign = await getCampaignDetail(session.user.id, id);
  if (!campaign?.brief) notFound();

  const isService = campaign.product?.isService ?? false;
  const brandName = campaign.product?.brandName ?? 'KOLLAB Global';
  const productName = campaign.product?.productName ?? 'สินค้า/บริการ';
  const targetLang = {
    code: campaign.country?.languageCode ?? 'en',
    name: campaign.country?.languageName ?? 'English',
    flag: campaign.country?.flag ?? '🇺🇸',
  };

  return (
    <BriefView
      campaignId={id}
      brandName={brandName}
      productName={productName}
      isService={isService}
      isPublished={!!campaign.brief.publishedAt}
      briefContent={campaign.brief.content}
      briefContentTh={campaign.brief.contentTh ?? null}
      targetLang={targetLang}
    />
  );
}
