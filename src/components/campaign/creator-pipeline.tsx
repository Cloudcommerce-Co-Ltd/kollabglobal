'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, FileText, Video, Send, CheckCircle } from 'lucide-react';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

type FilterKey = 'all' | 'creating' | 'waiting' | 'ship_pending' | 'done';
type StepState = 'done' | 'active' | 'pending';

function stepCls(s: StepState) {
  if (s === 'done') return 'bg-green-50 border-green-500 text-green-500';
  if (s === 'active') return 'bg-[#e8f0fa] border-secondary-brand text-secondary-brand';
  return 'bg-gray-100 border-gray-200 text-gray-300';
}

function connectorCls(a: StepState, b: StepState) {
  return a === 'done' && (b === 'done' || b === 'active') ? 'bg-green-500' : 'bg-gray-200';
}

function getStepStates(cc: CampaignCreatorWithRelation, isLive: boolean): StepState[] {
  if (isLive || cc.contentStatus === 'POSTED') return ['done', 'done', 'done', 'done'];
  if (cc.contentStatus === 'SUBMITTED') return ['done', 'done', 'active', 'pending'];
  if (cc.contentStatus === 'CREATING') return ['done', 'active', 'pending', 'pending'];
  if (cc.status === 'ACCEPTED') return ['done', 'pending', 'pending', 'pending'];
  return ['active', 'pending', 'pending', 'pending'];
}

function getCreatorLabel(cc: CampaignCreatorWithRelation, isLive: boolean): string {
  if (isLive || cc.contentStatus === 'POSTED') return 'โพสต์ครบ';
  if (cc.contentStatus === 'SUBMITTED') return 'กำลังสร้าง';
  if (cc.contentStatus === 'CREATING') return 'กำลังสร้าง';
  if (cc.status === 'ACCEPTED') return 'กำลังสร้าง';
  return 'รอสร้าง';
}

interface CreatorPipelineProps {
  creators: CampaignCreatorWithRelation[];
  isService: boolean;
  isLive?: boolean;
  displayStatus: string;
}

export function CreatorPipeline({ creators, isService, isLive = false, displayStatus }: CreatorPipelineProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const stepIcons = isService
    ? [FileText, Video, Send, CheckCircle]
    : [Package, Video, Send, CheckCircle];

  if (displayStatus !== 'active' && displayStatus !== 'live') {
    const msg =
      displayStatus === 'brief'
        ? 'สร้าง Brief'
        : displayStatus === 'accepting'
        ? 'ครีเอเตอร์ทุกคนตอบรับ'
        : 'ส่งสินค้า';
    return (
      <div className="bg-white rounded-2xl p-5 opacity-40 border border-border-ui">
        <div className="font-bold text-muted-text mb-1">Creator Pipeline</div>
        <div className="text-sm text-muted-text">จะแสดงเมื่อ{msg}แล้ว</div>
      </div>
    );
  }

  const filterOpts: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    ...(isLive
      ? [{ key: 'done' as FilterKey, label: 'โพสต์ครบ' }]
      : [
          { key: 'creating' as FilterKey, label: 'กำลังสร้าง' },
          { key: 'waiting' as FilterKey, label: 'รอสร้าง' },
          ...(!isService ? [{ key: 'ship_pending' as FilterKey, label: 'รอรับสินค้า' }] : []),
        ]),
  ];

  function countFor(key: FilterKey) {
    if (key === 'all') return creators.length;
    return creators.filter(c => getCreatorLabel(c, isLive) === labelForKey(key)).length;
  }

  function labelForKey(key: FilterKey) {
    if (key === 'creating') return 'กำลังสร้าง';
    if (key === 'waiting') return 'รอสร้าง';
    if (key === 'ship_pending') return 'รอรับสินค้า';
    if (key === 'done') return 'โพสต์ครบ';
    return '';
  }

  const filtered =
    filter === 'all'
      ? creators
      : creators.filter(c => getCreatorLabel(c, isLive) === labelForKey(filter));

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border-ui">
      {/* Header + tabs */}
      <div className="px-5 pt-3.5 border-b border-border-ui">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[17px] text-dark">Creator Pipeline</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand/10 text-brand">
              {creators.length} คน
            </span>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex">
          {filterOpts.map(opt => {
            const cnt = countFor(opt.key);
            const isActive = filter === opt.key;
            const isShip = opt.key === 'ship_pending';
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={[
                  'px-3.5 py-2 text-[13px] bg-transparent transition-all -mb-px border-b-2',
                  isActive
                    ? isShip
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
        const ss = getStepStates(cc, isLive);
        return (
          <div
            key={cc.id}
            className={`flex items-center gap-3 px-5 py-4${i < filtered.length - 1 ? ' border-b border-border-ui' : ''}`}
          >
            {/* Row number */}
            <div className="w-5 shrink-0 text-center text-xs font-semibold text-muted-text">{i + 1}</div>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden bg-brand-light border-2 border-border-ui">
              {cc.creator.avatar ? (
                <Image
                  src={cc.creator.avatar}
                  alt={cc.creator.name}
                  fill
                  className="object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  unoptimized
                />
              ) : (
                <span className="text-muted-text text-sm font-medium">{cc.creator.name.charAt(0)}</span>
              )}
            </div>

            {/* Name + niche */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-dark truncate">{cc.creator.name}</div>
              <div className="text-xs text-muted-text">{cc.creator.niche}</div>
            </div>

            {/* Step indicators */}
            <div className="ml-auto shrink-0 flex items-center gap-1">
              {stepIcons.map((Icon, j) => (
                <div key={j} className="flex items-center gap-1">
                  <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 border-2 ${stepCls(ss[j])}`}>
                    <Icon size={10} />
                  </div>
                  {j < 3 && <div className={`w-2 h-0.5 rounded ${connectorCls(ss[j], ss[j + 1])}`} />}
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
