'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Users, CheckCircle } from 'lucide-react';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

interface AcceptingCardProps {
  creators: CampaignCreatorWithRelation[];
  isService: boolean;
  onAllAccepted: (targetStatus: 'AWAITING_SHIPMENT' | 'ACTIVE') => void;
}

export function AcceptingCard({
  creators,
  isService,
  onAllAccepted,
}: AcceptingCardProps) {
  const total = creators.length;
  const initAccepted = creators.filter(c => c.status === 'ACCEPTED').length;
  const [accepted, setAccepted] = useState(initAccepted);
  const [simulating, setSimulating] = useState(false);
  const [done, setDone] = useState(false);
  const pct = total > 0 ? Math.round((accepted / total) * 100) : 0;

  function simulate() {
    if (simulating || done) return;
    setSimulating(true);
    let cur = accepted;
    const tick = () => {
      cur = Math.min(cur + 1, total);
      setAccepted(cur);
      if (cur < total) {
        setTimeout(tick, 280);
      } else {
        setDone(true);
        setSimulating(false);
        setTimeout(
          () => onAllAccepted(isService ? 'ACTIVE' : 'AWAITING_SHIPMENT'),
          900,
        );
      }
    };
    tick();
  }

  const primaryColor = '#4ECDC4';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
      style={{ border: `1px solid ${done ? primaryColor + '60' : '#fde68a'}` }}
    >
      {/* Header */}
      <div
        className="px-6 py-4.5 flex items-center justify-between transition-all duration-300"
        style={{
          background: done
            ? `linear-gradient(135deg, #e8f8f7, #e8f0fa)`
            : `linear-gradient(135deg, #fef9ec, #fef3c7)`,
          borderBottom: `1px solid ${done ? primaryColor + '30' : '#fde68a'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
            style={{ background: done ? primaryColor : '#d97706' }}
          >
            <Users size={22} color="#fff" />
          </div>
          <div>
            <div className="text-[17px] font-bold text-[#4A4A4A]">
              {done ? 'ครีเอเตอร์ตอบรับครบแล้ว!' : 'รอตอบรับจากครีเอเตอร์'}
            </div>
            <div className="text-sm text-[#8a90a3] mt-0.5">
              ส่ง invitation ให้ครีเอเตอร์ {total} คนแล้ว
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-extrabold transition-colors duration-300"
            style={{ color: done ? primaryColor : '#d97706' }}
          >
            {accepted}/{total}
          </div>
          <div className="text-xs text-[#8a90a3]">ตอบรับแล้ว</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-3.5 border-b border-[#e8ecf0]">
        <div className="flex justify-between text-[13px] mb-1.5">
          <span className="text-[#8a90a3]">ความคืบหน้า</span>
          <span
            className="font-semibold transition-colors duration-300"
            style={{ color: done ? primaryColor : '#d97706' }}
          >
            {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#e8ecf0] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: done
                ? `linear-gradient(90deg, ${primaryColor}, #4A90D9)`
                : `linear-gradient(90deg, #f59e0b, #d97706)`,
            }}
          />
        </div>
        <div className="text-[13px] text-[#8a90a3] mt-2">
          {done
            ? `✓ ครีเอเตอร์ทุกคนตอบรับแล้ว — กำลังเปลี่ยนสถานะ…`
            : `เมื่อครีเอเตอร์ทุกคนตอบรับแล้ว ${
                isService
                  ? 'จะเริ่มสร้างคอนเทนต์ได้เลย'
                  : 'สถานะจะเปลี่ยนเป็นรอส่งสินค้า'
              }`}
        </div>
      </div>

      {/* Creator list */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[15px] font-bold text-[#4A4A4A]">
            รายชื่อครีเอเตอร์
          </div>
          {!done && (
            <button
              onClick={simulate}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                border: `1px solid ${simulating ? '#e8ecf0' : '#d97706'}`,
                background: simulating ? '#f5f7fa' : '#fef9ec',
                color: simulating ? '#8a90a3' : '#b45309',
                cursor: simulating ? 'not-allowed' : 'pointer',
              }}
            >
              {simulating ? (
                <>
                  <div
                    className="w-2.5 h-2.5 rounded-full border-[1.5px] animate-spin"
                    style={{
                      borderColor: '#d9770640',
                      borderTopColor: '#d97706',
                    }}
                  />
                  กำลังตอบรับ…
                </>
              ) : (
                '▶ จำลองครีเอเตอร์ตอบรับหมด'
              )}
            </button>
          )}
        </div>

        <div
          className="flex flex-col rounded-xl overflow-hidden"
          style={{ gap: 1, background: '#e8ecf0' }}
        >
          {creators.slice(0, 6).map((cc, i) => (
            <div
              key={cc.id}
              className="flex items-center gap-3 px-4 py-2.75 bg-white"
            >
              <div
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-lg shrink-0 relative overflow-hidden"
                style={{ background: '#e8f8f7' }}
              >
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
                  <span className="text-[#8a90a3] text-xs font-medium">{cc.creator.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#4A4A4A]">
                  {cc.creator.name}
                </div>
                <div className="text-xs text-[#8a90a3]">
                  Lifestyle & Content
                </div>
              </div>
              {i < accepted ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#e8f8f7', color: '#0d9488' }}
                >
                  <CheckCircle size={12} />
                  ตอบรับแล้ว
                </div>
              ) : (
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#fef3c7', color: '#b45309' }}
                >
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
