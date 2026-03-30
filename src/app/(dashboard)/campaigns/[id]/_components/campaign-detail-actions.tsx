'use client';

import { useRouter } from 'next/navigation';
import { CreatorPipeline } from '@/components/campaign/creator-pipeline';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

interface CampaignDetailActionsProps {
  campaignId: string;
  displayStatus: 'accepting' | 'ship';
  serializedCampaign: {
    creators?: CampaignCreatorWithRelation[];
  };
  isService: boolean;
  isDomestic?: boolean;
  creatorsCount?: number;
  campaignStatus: string;
}

export function CampaignDetailActions({
  campaignId,
  displayStatus,
  serializedCampaign,
  isService,
  isDomestic = false,
  creatorsCount = 0,
  campaignStatus,
}: CampaignDetailActionsProps) {
  const router = useRouter();
  const creators = serializedCampaign.creators ?? [];

  async function handleAllAccepted(targetStatus: 'AWAITING_SHIPMENT' | 'ACTIVE') {
    await fetch(`/api/campaigns/${campaignId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    });
    router.refresh();
  }

  async function handleShipped() {
    await fetch(`/api/campaigns/${campaignId}/shipment`, {
      method: 'PATCH',
    });
    router.refresh();
  }

  if (displayStatus === 'accepting') {
    return (
      <CreatorPipeline
        creators={creators}
        isService={isService}
        displayStatus={displayStatus}
        campaignStatus={campaignStatus}
        onAllAccepted={handleAllAccepted}
      />
    );
  }

  // displayStatus === 'ship'
  return (
    <CreatorPipeline
      creators={creators}
      isService={isService}
      displayStatus={displayStatus}
      campaignStatus={campaignStatus}
      isDomestic={isDomestic}
      creatorsCount={creatorsCount}
      onShipped={handleShipped}
    />
  );
}
