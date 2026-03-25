'use client';

import { useMemo, useState } from 'react';
import { StatusTabs } from './status-tabs';
import { CampaignTable } from './campaign-table';
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants';
import type { CampaignListItem } from '@/types/campaign';
import type { CampaignStatus } from '@/types/index';

interface CampaignDashboardProps {
  campaigns: CampaignListItem[];
}

export function CampaignDashboard({ campaigns }: CampaignDashboardProps) {
  const [tab, setTab] = useState<'all' | CampaignStatus>('all');

  const counts = useMemo(
    () => campaigns.reduce<Partial<Record<CampaignStatus, number>>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
    [campaigns]
  );

  const sorted = useMemo(() => {
    const filtered = tab === 'all' ? campaigns : campaigns.filter((c) => c.status === tab);
    return [...filtered].sort(
      (a, b) => CAMPAIGN_STATUS_CONFIG[a.status].sortOrder - CAMPAIGN_STATUS_CONFIG[b.status].sortOrder
    );
  }, [campaigns, tab]);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-surface">
      <StatusTabs
        activeTab={tab}
        onTabChange={setTab}
        counts={counts}
        totalCount={campaigns.length}
      />
      <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-8">
        <CampaignTable campaigns={sorted} />
      </div>
    </div>
  );
}
