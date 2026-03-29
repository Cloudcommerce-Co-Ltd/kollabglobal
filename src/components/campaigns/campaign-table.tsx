'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Plus } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
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
    c => c.status === 'ACCEPTED' || c.status === 'COMPLETED',
  ).length;
  const pending = creators.filter(c => c.status === 'PENDING').length;
  return { accepted, total, pending };
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg width="140" height="140" viewBox="0 0 110 110" fill="none">
        <circle cx="55" cy="55" r="40" className="fill-brand-light stroke-brand" strokeWidth="2.5" />
        <line x1="15" y1="55" x2="95" y2="55" className="stroke-brand" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
        <line x1="20" y1="37" x2="90" y2="37" className="stroke-brand" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
        <line x1="20" y1="73" x2="90" y2="73" className="stroke-brand" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
        <ellipse cx="55" cy="55" rx="18" ry="40" className="stroke-brand" strokeWidth="1" strokeDasharray="6 4" fill="none" opacity="0.6" />
        <line x1="55" y1="38" x2="55" y2="23" className="stroke-brand" strokeWidth="2" />
        <circle cx="55" cy="23" r="4" fill="white" className="stroke-brand" strokeWidth="2" />
        <circle cx="55" cy="38" r="7" className="fill-brand" />
        <line x1="76" y1="47" x2="76" y2="34" className="stroke-accent-brand" strokeWidth="1.8" />
        <circle cx="76" cy="34" r="3.5" fill="white" className="stroke-accent-brand" strokeWidth="1.8" />
        <circle cx="76" cy="47" r="5.5" className="fill-accent-brand" opacity="0.85" />
        <line x1="36" y1="63" x2="36" y2="50" className="stroke-secondary-brand" strokeWidth="1.8" />
        <circle cx="36" cy="50" r="3.5" fill="white" className="stroke-secondary-brand" strokeWidth="1.8" />
        <circle cx="36" cy="63" r="5.5" className="fill-secondary-brand" opacity="0.8" />
      </svg>

      <div>
        <p className="mb-2 text-[17px] font-bold text-dark">ยังไม่มีแคมเปญ</p>
        <p className="max-w-65 text-[14px] leading-relaxed text-muted-text">
          เลือกตลาดและเริ่มโปรโมทแบรนด์<br />ผ่านครีเอเตอร์ทั่วโลก
        </p>
      </div>

      <Link
        href="/campaigns/new/country?new=1"
        className="mt-1 flex items-center gap-2 rounded-[10px] bg-linear-to-br from-brand to-secondary-brand px-7 py-3 text-[15px] font-semibold text-white hover:opacity-90"
      >
        <Plus size={15} strokeWidth={2.5} />
        สร้างแคมเปญแรก
      </Link>
    </div>
  );
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-border-ui bg-white">
      {/* Desktop header row */}
      <div className="hidden grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_0.7fr] gap-3 border-b border-border-ui bg-[#fafbfc] px-5 py-2.5 sm:grid">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-text">แคมเปญ</div>
        <div className="text-center text-[12px] font-semibold uppercase tracking-wide text-muted-text">ประเทศ</div>
        <div className="text-center text-[12px] font-semibold uppercase tracking-wide text-muted-text">สถานะ</div>
        <div className="text-center text-[12px] font-semibold uppercase tracking-wide text-muted-text">ครีเอเตอร์</div>
        <div />
      </div>

      {campaigns.map(c => {
        const statusCfg = CAMPAIGN_STATUS_CONFIG[c.status];
        const { accepted, total } = getCreatorCounts(c.creators);
        const platforms = c.package?.platforms ?? [];
        const displayName =
          c.product?.productName ?? `แคมเปญ #${c.id.slice(-4)}`;

        const href =
          c.status === 'AWAITING_PAYMENT'
            ? `/campaigns/${c.id}/checkout`
            : `/campaigns/${c.id}`;

        return (
          <Link
            key={c.id}
            href={href}
            className="block border-b border-border-ui last:border-b-0 transition-colors hover:bg-[#fafbfc]"
          >
            {/* Desktop row */}
            <div className="hidden grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_0.7fr] items-center gap-3 px-5 py-3.5 sm:grid">
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
                        {platforms.map(p => (
                          <PlatformIcon key={p} platform={p} size={13} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Country */}
              <div className="flex justify-center items-center gap-1.5 text-[13px] text-dark">
                {c.country ? (
                  <>
                    <ReactCountryFlag
                      countryCode={c.country.countryCode}
                      svg
                      className="w-4! h-4!"
                    />
                    <span className="truncate">{c.country.name}</span>
                  </>
                ) : (
                  <span className="text-muted-text">—</span>
                )}
              </div>

              {/* Column 3: Status pill */}
              <div className="text-center">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${statusCfg.pillClass}`}
                >
                  {statusCfg.label}
                </span>
              </div>

              {/* Column 3: Creator count */}
              <div className="text-center text-[15px] font-semibold text-dark">
                {accepted}/{c.package?.numCreators ?? total}
              </div>

              {/* Column 4: Actions */}
              <div className="flex items-center justify-end gap-2">
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
                    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-text">
                      {c.country && (
                        <>
                          <ReactCountryFlag
                            countryCode={c.country.countryCode}
                            svg
                            className="w-3.5! h-3.5! rounded-sm"
                          />
                          <span>{c.country.name} •</span>
                        </>
                      )}
                      <span>
                        {c.package?.numCreators ?? total} ครีเอเตอร์ •{' '}
                        {accepted}/{c.package?.numCreators ?? total} ตอบรับ
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-text mt-0.5 shrink-0"
                  />
                </div>
                <div className="mt-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.pillClass}`}
                  >
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
