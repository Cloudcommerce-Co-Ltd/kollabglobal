import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ResumeCheckoutClient } from './_components/resume-checkout-client';

export default async function ResumeCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: {
      package: true,
      products: true,
      creators: { include: { creator: true } },
    },
  });

  if (!campaign) redirect('/campaigns');

  if (campaign.status !== 'AWAITING_PAYMENT') {
    redirect(`/campaigns/${id}`);
  }

  return (
    <ResumeCheckoutClient
      campaignId={id}
      packageData={{
        name: campaign.package!.name,
        numCreators: campaign.package!.numCreators,
        price: campaign.package!.price,
        deliverables: campaign.package!.deliverables as string[],
      }}
      productData={{
        brandName: campaign.products[0]!.brandName,
        productName: campaign.products[0]!.productName,
        isService: campaign.products[0]!.isService,
        category: campaign.products[0]!.category,
      }}
      creators={campaign.creators.map(cc => ({
        id: cc.creator.id,
        name: cc.creator.name,
        avatar: cc.creator.avatar,
      }))}
    />
  );
}
