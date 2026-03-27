'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Package, Truck, ChevronRight } from 'lucide-react';
import type { CampaignCreatorWithRelation } from '@/types/campaign';

interface ShipmentCardProps {
  creators: CampaignCreatorWithRelation[];
  creatorsCount: number;
  isDomestic: boolean;
  onShipped: () => Promise<void>;
}

export function ShipmentCard({ creators, creatorsCount, isDomestic, onShipped }: ShipmentCardProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onShipped();
    setConfirmed(true);
    setLoading(false);
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border-2 ${confirmed ? 'border-brand/40' : 'border-red-300'}`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b ${confirmed ? 'bg-gradient-to-br from-brand-light to-secondary-brand-light border-brand/40' : 'bg-gradient-to-br from-red-100 to-red-200 border-red-300'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${confirmed ? 'bg-brand' : 'bg-red-600'}`}>
            <Truck size={22} color="#fff" />
          </div>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-dark">
              {confirmed ? 'จัดส่งเรียบร้อยแล้ว' : 'จัดการการจัดส่งสินค้า'}
            </div>
            <div className="text-sm text-muted-text mt-0.5">
              ส่งสินค้าให้ครีเอเตอร์ {creatorsCount} คน
            </div>
          </div>
          {/* CTA in header */}
          {isDomestic ? (
            confirmed ? (
              <div className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px] bg-brand-light text-teal-700 border border-brand/30">
                <CheckCircle size={16} />
                จัดส่งเรียบร้อย
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px] text-white bg-brand hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                <CheckCircle size={16} />
                {loading ? 'กำลังบันทึก...' : 'ยืนยันจัดส่งเรียบร้อย'}
              </button>
            )
          ) : (
            <a
              href="https://connex.com/shipments"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px] text-white bg-red-600 no-underline"
            >
              <Truck size={16} />
              Go to Connex
              <ChevronRight size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Creator list */}
      <div className="px-6 py-5">
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
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    unoptimized
                  />
                ) : (
                  <span className="text-muted-text text-sm font-medium">{cc.creator.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] text-dark">{cc.creator.name}</div>
              </div>
              {confirmed ? (
                <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold bg-brand-light text-teal-700">
                  <CheckCircle size={13} />
                  จัดส่งแล้ว
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold bg-warning-bg text-amber-700">
                  <Package size={13} />
                  รอส่งสินค้า
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
