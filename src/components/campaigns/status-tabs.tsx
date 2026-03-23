'use client';

import { CAMPAIGN_STATUS_TABS } from '@/lib/constants';
import type { CampaignStatus } from '@/types/index';

interface StatusTabsProps {
  activeTab: 'all' | CampaignStatus;
  onTabChange: (tab: 'all' | CampaignStatus) => void;
  counts: Partial<Record<CampaignStatus, number>>;
  totalCount: number;
}

export function StatusTabs({ activeTab, onTabChange, counts, totalCount }: StatusTabsProps) {
  return (
    <div className="border-b border-[#e8ecf0] bg-white px-4 sm:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex overflow-x-auto">
          {CAMPAIGN_STATUS_TABS.map(({ key, label }) => {
            const count = key === 'all' ? totalCount : (counts[key as CampaignStatus] ?? 0);
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`shrink-0 cursor-pointer border-b-[3px] bg-transparent px-4 py-3.5 text-[14px] font-medium transition-colors duration-200 ${
                  isActive
                    ? 'border-[#4ECDC4] text-[#4ECDC4]'
                    : 'border-transparent text-[#8a90a3] hover:text-[#4a4a4a]'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
