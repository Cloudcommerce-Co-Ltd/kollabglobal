import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { auth } from '@/auth';
import { getCampaignDetail } from '@/lib/data/campaigns';
import {
  resolveDisplayStatus,
  getStatusBadge,
} from '@/lib/campaign-detail-utils';
import { computeDurationDisplay } from '@/lib/campaign-duration';
import { CampaignIcon } from '@/components/ui/campaign-icon';
import { PlatformIcon } from '@/components/icons/platform-icons';
import { ActionCard } from '@/components/campaign/action-card';
import { CreatorPipeline } from '@/components/campaign/creator-pipeline';
import { StatsBar } from '@/components/campaign/stats-bar';
import { CampaignDetailActions } from './_components/campaign-detail-actions';

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const acceptTest = resolvedSearchParams['accept-test'] ?? resolvedSearchParams['accecpt-test'];
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const campaign = await getCampaignDetail(session.user.id, id);
  if (!campaign) notFound();

  const displayStatus = resolveDisplayStatus(campaign);

  if (displayStatus === 'awaiting_payment') {
    // Do not redirect to checkout — the session store may be empty after a refresh
    // and the checkout page would fail without campaign creation data.
    // Fall through to render the awaiting_payment status UI below.
  }
  const badge = getStatusBadge(displayStatus);

  // Extract deadline from brief content (deadline lives in Thai content)
  let briefDeadline: string | null = null;
  if (campaign.brief?.content) {
    try {
      const raw = campaign.brief.contentTh ?? campaign.brief.content;
      const parsed = JSON.parse(raw) as { deadline?: string };
      briefDeadline = parsed.deadline ?? null;
    } catch {
      briefDeadline = null;
    }
  }

  const durationDisplay = computeDurationDisplay({
    displayStatus,
    duration: campaign.duration,
    deadline: briefDeadline,
    liveAt: campaign.liveAt?.toISOString() ?? null,
  });
  const isService = campaign.products?.[0]?.isService ?? false;
  const isLive = displayStatus === 'live';
  const isDomestic = campaign.country?.name === 'Thailand';
  let creators = campaign.creators ?? [];

  if (process.env.NODE_ENV === 'development' && acceptTest && typeof acceptTest === 'string') {
    const acceptCount = Number.parseInt(acceptTest, 10);
    if (!Number.isNaN(acceptCount)) {
      creators = creators.map((c, index) => ({
        ...c,
        status: index < acceptCount ? 'ACCEPTED' : (c.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING'),
      }));
    }
  }

  const platforms = campaign.package?.platforms ?? [];
  const creatorsCount = campaign.package?.numCreators ?? creators.length;
  const brandName = campaign.products?.[0]?.brandName ?? 'แคมเปญ';
  const productName = campaign.products?.[0]?.productName ?? 'สินค้า/บริการ';
  const countryName = campaign.country?.name ?? '';
  const campaignTitle = countryName
    ? `${brandName} x ${countryName}`
    : brandName;

  const serializedCampaign = {
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    brief: campaign.brief
      ? {
          ...campaign.brief,
          publishedAt: campaign.brief.publishedAt?.toISOString() ?? null,
          createdAt: campaign.brief.createdAt.toISOString(),
          updatedAt: campaign.brief.updatedAt.toISOString(),
        }
      : null,
    creators: creators.map(cc => ({
      ...cc,
      creator: cc.creator,
    })),
  };

  const briefDoneCard = (
    <ActionCard
      icon={<FileText size={22} color="#0d9488" />}
      iconBg="bg-brand-light"
      borderColor="border-brand/25"
      title="Campaign Brief"
      badge="เสร็จแล้ว"
      badgeBg="bg-brand-light"
      badgeText="text-teal-700"
      description="กำหนดแนวทางแคมเปญเรียบร้อยแล้ว"
      button={
        <Link
          href={`/campaigns/${id}/brief`}
          className="px-4 py-2 rounded-xl font-semibold text-sm border border-border-ui text-dark hover:bg-surface transition-colors whitespace-nowrap"
        >
          ดู Brief
        </Link>
      }
      check
    />
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-border-ui px-5 sm:px-8 py-5">
        <div className="mx-auto max-w-275">
          <Link
            href="/campaigns"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-text hover:text-dark mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            กลับไปแคมเปญทั้งหมด
          </Link>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CampaignIcon product={campaign.products?.[0] ?? null} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-dark m-0">
                  {campaignTitle}
                </h1>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <p className="text-sm text-muted-text m-0">
                    {productName} • {creatorsCount} ครีเอเตอร์ •{' '}
                    <span className={durationDisplay.isOverdue ? 'text-red-600 font-semibold' : ''}>
                      {durationDisplay.text}
                    </span>
                  </p>
                  {isService && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary-brand-light text-secondary-brand">
                      บริการ
                    </span>
                  )}
                  {platforms.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-px h-3 bg-border-ui" />
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
            <span
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold ${badge.cls}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats bar (active/live only) */}
      {(displayStatus === 'active' || isLive) && (
        <div className="bg-white border-b border-border-ui px-5 sm:px-8 py-3.5">
          <div className="mx-auto max-w-275">
            <StatsBar
              activeCount={creators.filter(c => c.status === 'ACCEPTED').length}
              totalCount={creatorsCount}
              platformCount={platforms.length}
              isLive={isLive}
              durationDisplay={durationDisplay}
            />
          </div>
        </div>
      )}

      {/* Content — interactive parts handled by client component */}
      <div className="mx-auto max-w-275 px-5 sm:px-8 py-6">
        {displayStatus === 'awaiting_payment' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mb-3 text-3xl">⏳</div>
            <h2 className="mb-2 text-lg font-bold text-dark">รอการชำระเงิน</h2>
            <p className="mb-5 text-sm text-muted-text">
              แคมเปญนี้ยังรอการยืนยันการชำระเงิน
              <br />
              หากคุณยังอยู่ระหว่างสแกน QR สามารถกลับไปที่หน้าชำระเงินได้
            </p>
            <Link
              href={`/campaigns/${id}/checkout`}
              className="inline-block rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              กลับไปหน้าชำระเงิน
            </Link>
          </div>
        )}

        {displayStatus === 'brief' && (
          <ActionCard
            icon={<FileText size={22} color="#b45309" />}
            iconBg="bg-warning-bg"
            borderColor="border-[#fde68a]"
            title="Campaign Brief"
            badge="ต้องดำเนินการ"
            badgeBg="bg-warning-bg"
            badgeText="text-amber-700"
            description={`สร้าง Brief เพื่อกำหนดแนวทางการโปรโมท${isService ? 'บริการ' : 'สินค้า'}`}
            button={
              <Link
                href={`/campaigns/${id}/brief/new`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity whitespace-nowrap bg-amber-700"
              >
                <FileText size={15} />
                สร้าง Brief
              </Link>
            }
          />
        )}

        {displayStatus === 'accepting' && (
          <div className="space-y-3">
            {briefDoneCard}
            <CampaignDetailActions
              campaignId={id}
              displayStatus={displayStatus}
              serializedCampaign={serializedCampaign}
              isService={isService}
              campaignStatus={campaign.status}
            />
          </div>
        )}

        {displayStatus === 'ship' && (
          <div className="space-y-3">
            {briefDoneCard}
            <CampaignDetailActions
              campaignId={id}
              displayStatus={displayStatus}
              serializedCampaign={serializedCampaign}
              isService={isService}
              isDomestic={isDomestic}
              creatorsCount={creatorsCount}
              campaignStatus={campaign.status}
            />
          </div>
        )}

        {(displayStatus === 'active' || isLive) && (
          <div className="space-y-3">
            {briefDoneCard}
            <CreatorPipeline
              creators={serializedCampaign.creators}
              isService={isService}
              isLive={isLive}
              displayStatus={displayStatus}
              campaignStatus={campaign.status}
            />
          </div>
        )}

        {displayStatus === 'brief' && (
          <div className="mt-5 opacity-50 pointer-events-none select-none grayscale">
            <CreatorPipeline
              creators={serializedCampaign.creators}
              isService={isService}
              displayStatus={displayStatus}
              campaignStatus={campaign.status}
            />
          </div>
        )}

        {displayStatus === 'cancelled' && (
          <div className="rounded-2xl border border-border-ui bg-white p-6 text-center text-muted-text">
            <p className="text-sm font-medium">แคมเปญนี้ถูกยกเลิกแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
