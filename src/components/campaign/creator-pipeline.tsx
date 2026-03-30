'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  FileText,
  CheckCircle,
  Users,
  Truck,
  ChevronRight,
} from 'lucide-react';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

/* ─── Step semantics ──────────────────────────────────────────────────── */
// 3-dot pipeline:
//   Dot 1  ตอบรับ        — PENDING (yellow) → ACCEPTED (green)
//   Dot 2  รับสินค้า      — product: PENDING (yellow) → received (green)
//                          service: auto-green (icon = FileText instead of Package)
//   Dot 3  โพสต์         — working (yellow) → POSTED (green)
/* ─────────────────────────────────────────────────────────────────────── */

type StepState = 'done' | 'active' | 'pending';

/** Filter keys — "active" state means the creator's CURRENT (yellow) step */
type FilterKey = 'all' | 'waiting_accept' | 'waiting_ship' | 'working' | 'done';

function stepCls(s: StepState) {
  if (s === 'done') return 'bg-green-50 border-green-500 text-green-500';
  if (s === 'active') return 'bg-amber-50 border-amber-400 text-amber-500';
  return 'bg-gray-100 border-gray-200 text-gray-300';
}

function connectorCls(a: StepState, b: StepState) {
  return a === 'done' && (b === 'done' || b === 'active')
    ? 'bg-green-500'
    : 'bg-gray-200';
}

/**
 * Derive the 3-step states for a creator.
 *
 * For **product** campaigns the campaign-level status tells us about shipment:
 *   - Campaign in ACCEPTING / AWAITING_SHIPMENT → shipment not done yet
 *   - Campaign in ACTIVE / COMPLETED → shipment done
 *
 * For **service** campaigns dot 2 is always green.
 */
function getStepStates(
  cc: CampaignCreatorWithRelation,
  isService: boolean,
  campaignStatus: string,
  isLive: boolean,
): [StepState, StepState, StepState] {
  // Live → all green, no yellow
  if (isLive) return ['done', 'done', 'done'];

  // Dot 1 — accepted?
  const accepted = cc.status === 'ACCEPTED' || cc.status === 'COMPLETED';
  const dot1: StepState = accepted ? 'done' : 'active';

  if (!accepted) return [dot1, 'pending', 'pending'];

  // Dot 2 — shipment / service
  let dot2: StepState;
  if (isService) {
    dot2 = 'done'; // service → auto-green
  } else {
    // product: green once campaign reaches ACTIVE or beyond
    const shipped =
      campaignStatus === 'ACTIVE' || campaignStatus === 'COMPLETED';
    dot2 = shipped ? 'done' : 'active';
  }

  if (dot2 !== 'done') return [dot1, dot2, 'pending'];

  // Dot 3 — content
  if (cc.contentStatus === 'POSTED') return ['done', 'done', 'done'];
  if (cc.contentStatus === 'CREATING' || cc.contentStatus === 'SUBMITTED')
    return ['done', 'done', 'active'];
  // accepted + shipped but not started content yet → dot3 active
  return ['done', 'done', 'active'];
}

/** Human-readable label of a creator's current yellow step (for filtering) */
function getCurrentStep(
  cc: CampaignCreatorWithRelation,
  isService: boolean,
  campaignStatus: string,
  isLive: boolean,
): FilterKey {
  const ss = getStepStates(cc, isService, campaignStatus, isLive);
  if (ss[0] === 'active') return 'waiting_accept';
  if (ss[1] === 'active') return 'waiting_ship';
  if (ss[2] === 'active') return 'working';
  return 'done';
}

/* ─── Component ───────────────────────────────────────────────────────── */

interface CreatorPipelineProps {
  creators: CampaignCreatorWithRelation[];
  isService: boolean;
  isLive?: boolean;
  displayStatus: string;
  /** campaign.status from the database (e.g. ACCEPTING, ACTIVE) */
  campaignStatus: string;
  onAllAccepted?: (targetStatus: 'AWAITING_SHIPMENT' | 'ACTIVE') => void;
  /** Shipment props — only needed when displayStatus === 'ship' */
  isDomestic?: boolean;
  creatorsCount?: number;
  onShipped?: () => Promise<void>;
}

export function CreatorPipeline({
  creators,
  isService,
  isLive = false,
  displayStatus,
  campaignStatus,
  onAllAccepted,
  isDomestic = false,
  creatorsCount = 0,
  onShipped,
}: CreatorPipelineProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [shipConfirmed, setShipConfirmed] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);

  // Step icons — service uses FileText for dot 2 instead of Package
  const stepIcons = [
    CheckCircle, // dot 1: accepted
    isService ? FileText : Package, // dot 2: shipment / service
    CheckCircle, // dot 3: posted
  ];

  const stepLabels = ['ตอบรับ', isService ? 'บริการ' : 'รับสินค้า', 'โพสต์'];

  // ── Accepting header ──
  const isAccepting = displayStatus === 'accepting';
  const isShipping = displayStatus === 'ship';
  const total = creators.length;
  const accepted = creators.filter(
    c => c.status === 'ACCEPTED' || c.status === 'COMPLETED',
  ).length;
  const allAccepted = total > 0 && accepted === total;

  // Auto-transition when all accepted
  useEffect(() => {
    if (isAccepting && allAccepted && onAllAccepted) {
      onAllAccepted(isService ? 'ACTIVE' : 'AWAITING_SHIPMENT');
    }
  }, [isAccepting, allAccepted, onAllAccepted, isService]);

  async function handleShipConfirm() {
    if (!onShipped) return;
    setShipLoading(true);
    await onShipped();
    setShipConfirmed(true);
    setShipLoading(false);
  }

  // ── Filter options ──
  const filterOpts: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'waiting_accept', label: 'รอตอบรับ' },
    ...(!isService
      ? [{ key: 'waiting_ship' as FilterKey, label: 'รอรับสินค้า' }]
      : []),
    { key: 'working', label: 'กำลังสร้าง' },
    { key: 'done', label: 'เสร็จสิ้น' },
  ];

  function countFor(key: FilterKey) {
    if (key === 'all') return creators.length;
    return creators.filter(
      c => getCurrentStep(c, isService, campaignStatus, isLive) === key,
    ).length;
  }

  const filtered =
    filter === 'all'
      ? creators
      : creators.filter(
          c => getCurrentStep(c, isService, campaignStatus, isLive) === filter,
        );

  /* ── Render header based on displayStatus ── */
  function renderHeader() {
    if (isAccepting) {
      return (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-warning-text">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[17px] text-dark leading-tight">
                รอตอบรับจากครีเอเตอร์
              </div>
              <div className="text-sm text-muted-text">
                ส่ง invitation ให้ครีเอเตอร์ {total} คนแล้ว
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-xl font-extrabold ${allAccepted ? 'text-brand' : 'text-warning-text'}`}
            >
              {accepted}/{total}
            </div>
            <div className="text-xs text-muted-text">ตอบรับแล้ว</div>
          </div>
        </div>
      );
    }

    if (isShipping) {
      return (
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${shipConfirmed ? 'bg-brand' : 'bg-danger'}`}
              >
                <Truck size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-[17px] text-dark leading-tight">
                  {shipConfirmed
                    ? 'จัดส่งเรียบร้อยแล้ว'
                    : 'จัดการการจัดส่งสินค้า'}
                </div>
                <div className="text-sm text-muted-text">
                  ส่งสินค้าให้ครีเอเตอร์ {creatorsCount || total} คน
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isDomestic ? (
                shipConfirmed ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm bg-brand-light text-brand border border-brand/30">
                    <CheckCircle size={14} />
                    จัดส่งเรียบร้อย
                  </div>
                ) : (
                  <button
                    onClick={handleShipConfirm}
                    disabled={shipLoading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-xs text-white bg-brand hover:opacity-90 transition-opacity disabled:opacity-70"
                  >
                    <CheckCircle size={14} />
                    {shipLoading ? 'กำลังบันทึก...' : 'ดำเนินการส่งแล้ว'}
                  </button>
                )
              ) : (
                <a
                  href="https://connex.com/shipments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-md text-white bg-danger no-underline"
                >
                  <Truck size={14} />
                  Go to Connex
                  <ChevronRight size={14} />
                </a>
              )}
            </div>
          </div>
          <div className="py-4 space-y-3">
            {/* Card 1: Manage shipment at Connex */}
            <div className="flex gap-3 p-4 bg-surface/50 rounded-lg border border-border-ui">
              <div className="w-8 h-8 rounded-full bg-[#E8F1FA] flex items-center justify-center shrink-0 text-[#4A94DA] font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm text-dark mb-1">
                  จัดการ Shipment ที่ Connex
                </h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  ใช้แพลตฟอร์ม Connex
                  เพื่อจัดการการจัดส่งสินค้าให้ครีเอเตอร์ทั้งหมด
                  รวมถึงติดตามสถานะการจัดส่ง
                </p>
              </div>
            </div>

            {/* Card 2: Wait for creators to receive */}
            <div className="flex gap-3 p-4 bg-surface/50 rounded-lg border border-border-ui">
              <div className="w-8 h-8 rounded-full bg-[#F2EFFA] flex items-center justify-center shrink-0 text-[#9C7ED8] font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm text-dark mb-1">
                  รอให้ครีเอเตอร์รับสินค้า
                </h4>
                <p className="text-xs text-muted-text leading-relaxed">
                  เมื่อส่งสินค้าแล้ว
                  ระบบจะฝั่งเตสถานะเอื่อในมีครีเอเตอร์ได้รับสินค้า
                  และพวกเขาจะเริ่มสร้างคอนเทนต์ได้
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default header (active / live / brief)
    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-[17px] text-dark">
            Creator Pipeline
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand/10 text-brand">
            {creators.length} คน
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border-ui">
      {/* Header */}
      <div className="px-5 pt-3.5 border-b border-border-ui">
        {renderHeader()}

        {/* Filter tabs */}
        <div className="flex">
          {filterOpts.map(opt => {
            const cnt = countFor(opt.key);
            const isActive = filter === opt.key;
            const isShipTab = opt.key === 'waiting_ship';
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={[
                  'px-3.5 py-2 text-[13px] bg-transparent transition-all -mb-px border-b-2',
                  isActive
                    ? isShipTab
                      ? 'font-bold text-orange-600 border-orange-600'
                      : 'font-bold text-brand border-brand'
                    : 'font-medium text-muted-text border-transparent',
                ].join(' ')}
              >
                {opt.label} <span className="text-xs opacity-80">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator rows */}
      {filtered.map((cc, i) => {
        const ss = getStepStates(cc, isService, campaignStatus, isLive);
        return (
          <div
            key={cc.id}
            className={`flex items-center gap-3 px-5 py-4${i < filtered.length - 1 ? ' border-b border-border-ui' : ''}`}
          >
            {/* Row number */}
            <div className="w-5 shrink-0 text-center text-xs font-semibold text-muted-text">
              {i + 1}
            </div>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden bg-brand-light border-2 border-border-ui">
              {cc.creator.avatar ? (
                <Image
                  src={cc.creator.avatar}
                  alt={cc.creator.name}
                  fill
                  className="object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  unoptimized
                />
              ) : (
                <span className="text-muted-text text-sm font-medium">
                  {cc.creator.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-dark truncate">
                {cc.creator.name}
              </div>
              <div className="text-xs text-muted-text">
                ยอดการเข้าถึง {cc.creator.reach}
              </div>
            </div>

            {/* Step indicators — 3 dots */}
            <div className="ml-auto shrink-0 flex items-center gap-1">
              {stepIcons.map((Icon, j) => (
                <div key={j} className="flex items-center gap-1">
                  <div
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 border-2 ${stepCls(ss[j])}`}
                    title={stepLabels[j]}
                  >
                    <Icon size={10} />
                  </div>
                  {j < 2 && (
                    <div
                      className={`w-2 h-0.5 rounded ${connectorCls(ss[j], ss[j + 1])}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-muted-text">
          ไม่มีครีเอเตอร์ในหมวดนี้
        </div>
      )}
    </div>
  );
}
