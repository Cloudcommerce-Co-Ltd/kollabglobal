'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Plus } from 'lucide-react';
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants';
import { PlatformIcon } from '@/components/icons/platform-icons';
import type { CampaignListItem } from '@/types/campaign';

interface CampaignTableProps {
  campaigns: CampaignListItem[];
}

function CampaignIcon({ product }: { product: CampaignListItem['product'] }) {
  if (product?.imageUrl) {
    return (
      <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px]">
        <Image
          src={product.imageUrl}
          alt={product.productName}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  const letter = product?.productName?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-brand-light text-lg font-bold text-brand">
      {letter}
    </div>
  );
}

function getCreatorCounts(creators: CampaignListItem['creators']) {
  const total = creators.length;
  const accepted = creators.filter(
    (c) => c.status === 'ACCEPTED' || c.status === 'COMPLETED'
  ).length;
  const pending = creators.filter((c) => c.status === 'PENDING').length;
  return { accepted, total, pending };
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-light">
        <Plus size={24} className="text-brand" />
      </div>
      <p className="mb-1 text-[16px] font-semibold text-dark">ยังไม่มีแคมเปญ</p>
      <p className="mb-5 text-[13px] text-muted-text">สร้างแคมเปญแรกของคุณเพื่อเริ่มต้น</p>
      <Link
        href="/campaigns/new/country?new=1"
        className="rounded-[10px] bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
      >
        สร้างแคมเปญใหม่
      </Link>
    </div>
  );
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-[14px] border border-border-ui bg-white">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-border-ui bg-white">
      {/* Desktop header row */}
      <div className="hidden grid-cols-[2.5fr_1fr_1.2fr_0.9fr_1.2fr] gap-3 border-b border-border-ui bg-[#fafbfc] px-5 py-2.5 sm:grid">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-text">แคมเปญ</div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-text">ประเทศ</div>
        <div className="text-center text-[12px] font-semibold uppercase tracking-wide text-muted-text">สถานะ</div>
        <div className="text-center text-[12px] font-semibold uppercase tracking-wide text-muted-text">ครีเอเตอร์</div>
        <div />
      </div>

      {campaigns.map((c) => {
        const statusCfg = CAMPAIGN_STATUS_CONFIG[c.status];
        const { accepted, total, pending } = getCreatorCounts(c.creators);
        const platforms = c.package?.platforms ?? [];
        const displayName = c.product?.productName ?? `แคมเปญ #${c.id.slice(-4)}`;

        return (
          <Link
            key={c.id}
            href={`/campaigns/${c.id}`}
            className="block border-b border-border-ui last:border-b-0 transition-colors hover:bg-[#fafbfc]"
          >
            {/* Desktop row */}
            <div className="hidden grid-cols-[2.5fr_1fr_1.2fr_0.9fr_1.2fr] items-center gap-3 px-5 py-3.5 sm:grid">
              {/* Column 1: Campaign info */}
              <div className="flex items-center gap-3">
                <CampaignIcon product={c.product} />
                <div>
                  <div className="flex items-center gap-1.5 text-[15px] font-semibold text-dark">
                    {displayName}
                    {(c.status === 'PENDING' || c.status === 'ACCEPTING') && (
                      <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                        NEW
                      </span>
                    )}
                    {c.promotionType === 'SERVICE' && (
                      <span className="rounded bg-secondary-brand-light px-1.5 py-0.5 text-[11px] font-semibold text-secondary-brand">
                        บริการ
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[13px] text-muted-text">
                    <span>{c.package?.numCreators ?? total} ครีเอเตอร์</span>
                    {platforms.length > 0 && (
                      <span className="flex items-center gap-1">
                        {platforms.map((p) => (
                          <PlatformIcon key={p} platform={p} size={13} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Country */}
              <div className="flex items-center gap-1.5 text-[13px] text-dark">
                {c.country ? (
                  <>
                    <span>{c.country.flag}</span>
                    <span className="truncate">{c.country.name}</span>
                  </>
                ) : (
                  <span className="text-muted-text">—</span>
                )}
              </div>

              {/* Column 3: Status pill */}
              <div className="text-center">
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${statusCfg.pillClass}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Column 3: Creator count */}
              <div className="text-center text-[15px] font-semibold text-dark">
                {accepted}/{c.package?.numCreators ?? total}
              </div>

              {/* Column 4: Actions */}
              <div className="flex items-center justify-end gap-2">
                {pending > 0 && (
                  <span className="flex size-5.5 items-center justify-center rounded-full bg-danger text-[12px] font-bold text-white">
                    {pending}
                  </span>
                )}
                <ChevronRight size={16} className="text-muted-text" />
              </div>
            </div>

            {/* Mobile card */}
            <div className="flex items-start gap-3 px-4 py-3.5 sm:hidden">
              <CampaignIcon product={c.product} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1 text-[14px] font-semibold text-dark">
                      {displayName}
                      {(c.status === 'PENDING' || c.status === 'ACCEPTING') && (
                        <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                      {c.promotionType === 'SERVICE' && (
                        <span className="rounded bg-secondary-brand-light px-1.5 py-0.5 text-[10px] font-semibold text-secondary-brand">
                          บริการ
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-text">
                      {c.country ? `${c.country.flag} ${c.country.name} • ` : ''}{c.package?.numCreators ?? total} ครีเอเตอร์ • {accepted}/{c.package?.numCreators ?? total} ตอบรับ
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-text mt-0.5 shrink-0" />
                </div>
                <div className="mt-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.pillClass}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
