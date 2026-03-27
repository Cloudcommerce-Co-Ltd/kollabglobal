'use client';

import Image from 'next/image';
import { Users, CheckCircle } from 'lucide-react';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

interface AcceptingCardProps {
  creators: CampaignCreatorWithRelation[];
  isService: boolean;
  onAllAccepted: (targetStatus: 'AWAITING_SHIPMENT' | 'ACTIVE') => void;
}

export function AcceptingCard({ creators, isService, onAllAccepted }: AcceptingCardProps) {
  const total = creators.length;
  const accepted = creators.filter(c => c.status === 'ACCEPTED').length;
  const done = total > 0 && accepted === total;
  const pct = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border ${done ? 'border-brand/40' : 'border-[#fde68a]'}`}>
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between border-b ${
        done ? 'bg-gradient-to-br from-brand-light to-secondary-brand-light border-brand/20' : 'bg-gradient-to-br from-[#fef9ec] to-warning-bg border-[#fde68a]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-brand' : 'bg-warning-text'}`}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <div className="text-[17px] font-bold text-dark">
              {done ? 'ครีเอเตอร์ตอบรับครบแล้ว!' : 'รอตอบรับจากครีเอเตอร์'}
            </div>
            <div className="text-sm text-muted-text mt-0.5">
              ส่ง invitation ให้ครีเอเตอร์ {total} คนแล้ว
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-extrabold ${done ? 'text-brand' : 'text-warning-text'}`}>
            {accepted}/{total}
          </div>
          <div className="text-xs text-muted-text">ตอบรับแล้ว</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-3.5 border-b border-border-ui">
        <div className="flex justify-between text-[13px] mb-1.5">
          <span className="text-muted-text">ความคืบหน้า</span>
          <span className={`font-semibold ${done ? 'text-brand' : 'text-warning-text'}`}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-border-ui overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-gradient-to-r from-brand to-secondary-brand' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[13px] text-muted-text mt-2">
          {done
            ? '✓ ครีเอเตอร์ทุกคนตอบรับแล้ว'
            : `เมื่อครีเอเตอร์ทุกคนตอบรับแล้ว ${isService ? 'จะเริ่มสร้างคอนเทนต์ได้เลย' : 'สถานะจะเปลี่ยนเป็นรอส่งสินค้า'}`}
        </div>
      </div>

      {/* Creator list */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[15px] font-bold text-dark">รายชื่อครีเอเตอร์</div>
          {done && (
            <button
              onClick={() => onAllAccepted(isService ? 'ACTIVE' : 'AWAITING_SHIPMENT')}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
            >
              ดำเนินการต่อ →
            </button>
          )}
        </div>

        <div className="flex flex-col rounded-xl overflow-hidden gap-px bg-border-ui">
          {creators.map((cc, i) => (
            <div key={cc.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <div className="w-5 shrink-0 text-center text-xs font-semibold text-muted-text">{i + 1}</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden bg-brand-light">
                {cc.creator.avatar ? (
                  <Image
                    src={cc.creator.avatar}
                    alt={cc.creator.name}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    unoptimized
                  />
                ) : (
                  <span className="text-muted-text text-xs font-medium">{cc.creator.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-dark">{cc.creator.name}</div>
              </div>
              {cc.status === 'ACCEPTED' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-light text-teal-700">
                  <CheckCircle size={12} />
                  ตอบรับแล้ว
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-bg text-amber-700">
                  รอตอบรับ
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
