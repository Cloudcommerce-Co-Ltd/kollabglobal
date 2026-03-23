'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Eye, Send } from 'lucide-react';
import {
  fetchCampaign,
  confirmShipment,
  updateCampaignStatus,
} from '@/lib/brief-api';
import {
  resolveDisplayStatus,
  getStatusBadge,
} from '@/lib/campaign-detail-utils';
import { PlatformIcon } from '@/components/icons/platform-icons';
import { ActionCard } from '@/components/campaign/action-card';
import { AcceptingCard } from '@/components/campaign/accepting-card';
import { ShipmentCard } from '@/components/campaign/shipment-card';
import { CreatorPipeline } from '@/components/campaign/creator-pipeline';
import { StatsBar } from '@/components/campaign/stats-bar';
import type { CampaignWithRelations } from '@/types/campaign';

const PRIMARY = '#4ECDC4';
const PRIMARY_LIGHT = '#e8f8f7';

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign(id)
      .then(setCampaign)
      .catch(() => setError('ไม่พบแคมเปญนี้'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
        <p className="text-[#8a90a3] text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
        <p className="text-red-500 text-sm">{error ?? 'เกิดข้อผิดพลาด'}</p>
      </div>
    );
  }

  const displayStatus = resolveDisplayStatus(campaign);
  const badge = getStatusBadge(displayStatus);
  const isService = campaign.product?.isService ?? false;
  const isLive = displayStatus === 'live';
  const isDomestic = campaign.country?.name === 'Thailand';
  const creators = campaign.creators ?? [];
  const platforms = campaign.package?.platforms ?? [];
  const creatorsCount = campaign.package?.numCreators ?? creators.length;
  const brandName = campaign.product?.brandName ?? 'แคมเปญ';
  const productName = campaign.product?.productName ?? 'สินค้า/บริการ';
  const countryName = campaign.country?.name ?? '';
  const campaignTitle = countryName
    ? `${brandName} x ${countryName}`
    : brandName;

  async function handleShipped() {
    await confirmShipment(id);
    const updated = await fetchCampaign(id);
    setCampaign(updated);
  }

  async function handleAllAccepted(
    targetStatus: 'AWAITING_SHIPMENT' | 'ACTIVE',
  ) {
    await updateCampaignStatus(id, targetStatus);
    const updated = await fetchCampaign(id);
    setCampaign(updated);
  }

  const briefDoneCard = (
    <ActionCard
      icon={<FileText size={22} color="#0d9488" />}
      iconBg={PRIMARY_LIGHT}
      borderColor={`${PRIMARY}40`}
      title="Campaign Brief"
      badge="เสร็จแล้ว"
      badgeBg={PRIMARY_LIGHT}
      badgeText="#0d9488"
      description="กำหนดแนวทางแคมเปญเรียบร้อยแล้ว"
      button={
        <button
          onClick={() => router.push(`/campaigns/${id}/brief`)}
          className="px-4 py-2 rounded-xl font-semibold text-sm border border-[#e8ecf0] text-[#4A4A4A] hover:bg-[#f5f7fa] transition-colors whitespace-nowrap"
        >
          ดู Brief
        </button>
      }
      check
    />
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Page header — white bar like mvp */}
      <div
        className="bg-white border-b border-[#e8ecf0]"
        style={{ padding: '20px 32px' }}
      >
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <button
            onClick={() => router.push('/campaigns')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#8a90a3] hover:text-[#4A4A4A] mb-3 transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} />
            กลับไปแคมเปญทั้งหมด
          </button>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Emoji — 72x72 matching mvp */}
              <div
                className="flex items-center justify-center rounded-2xl shrink-0 text-[42px]"
                style={{
                  width: 72,
                  height: 72,
                  background: `linear-gradient(135deg, ${PRIMARY_LIGHT}, #e8f0fa)`,
                  border: `2px solid ${PRIMARY}30`,
                }}
              >
                🌟
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4A4A4A] m-0">
                  {campaignTitle}
                </h1>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <p className="text-sm text-[#8a90a3] m-0">
                    {productName} • {creatorsCount} ครีเอเตอร์ • 30 วัน
                  </p>
                  {isService && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e8f0fa] text-[#4A90D9]">
                      บริการ
                    </span>
                  )}
                  {platforms.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-px h-3 bg-[#e8ecf0]" />
                      <div className="flex items-center gap-1.5">
                        {platforms.map(p => (
                          <PlatformIcon key={p} platform={p} size={14} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status badge */}
            <span
              className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold"
              style={{ background: badge.bgColor, color: badge.textColor }}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats bar (active/live only) */}
      {(displayStatus === 'active' || isLive) && (
        <div
          className="bg-white border-b border-[#e8ecf0]"
          style={{ padding: '14px 32px' }}
        >
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <StatsBar
              activeCount={creators.filter(c => c.status === 'ACCEPTED').length}
              totalCount={creatorsCount}
              platformCount={platforms.length}
              isLive={isLive}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="mx-auto py-6"
        style={{ maxWidth: 1100, padding: '24px 32px' }}
      >
        {/* BRIEF state */}
        {displayStatus === 'brief' && (
          <ActionCard
            icon={<FileText size={22} color="#b45309" />}
            iconBg="#fef3c7"
            borderColor="#fde68a"
            title="Campaign Brief"
            badge="ต้องดำเนินการ"
            badgeBg="#fef3c7"
            badgeText="#b45309"
            description={`สร้าง Brief เพื่อกำหนดแนวทางการโปรโมท${isService ? 'บริการ' : 'สินค้า'}`}
            button={
              <button
                onClick={() => router.push(`/campaigns/${id}/brief/new`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: '#b45309' }}
              >
                <FileText size={15} />
                สร้าง Brief
              </button>
            }
          />
        )}

        {/* ACCEPTING state */}
        {displayStatus === 'accepting' && (
          <div className="space-y-3">
            {briefDoneCard}
            <AcceptingCard
              creators={creators}
              isService={isService}
              onAllAccepted={handleAllAccepted}
            />
          </div>
        )}

        {/* SHIP state */}
        {displayStatus === 'ship' && (
          <div className="space-y-3">
            {briefDoneCard}
            <ShipmentCard
              creators={creators}
              creatorsCount={creatorsCount}
              isDomestic={isDomestic}
              onShipped={handleShipped}
            />
          </div>
        )}

        {/* ACTIVE / LIVE state */}
        {(displayStatus === 'active' || isLive) && (
          <div className="space-y-3">
            {briefDoneCard}
            <CreatorPipeline
              creators={creators}
              isService={isService}
              isLive={isLive}
              displayStatus={displayStatus}
            />
          </div>
        )}

        {/* Creator pipeline placeholder for non-active states */}
        {displayStatus !== 'active' && !isLive && (
          <div className="mt-5">
            <CreatorPipeline
              creators={creators}
              isService={isService}
              displayStatus={displayStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
}
