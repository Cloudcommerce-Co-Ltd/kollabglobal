'use client';

import { useRouter } from 'next/navigation';
import { AcceptingCard } from '@/components/campaign/accepting-card';
import { ShipmentCard } from '@/components/campaign/shipment-card';
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
}

export function CampaignDetailActions({
  campaignId,
  displayStatus,
  serializedCampaign,
  isService,
  isDomestic = false,
  creatorsCount = 0,
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
      <AcceptingCard
        creators={creators}
        isService={isService}
        onAllAccepted={handleAllAccepted}
      />
    );
  }

  return (
    <ShipmentCard
      creators={creators}
      creatorsCount={creatorsCount}
      isDomestic={isDomestic}
      onShipped={handleShipped}
    />
  );
}
