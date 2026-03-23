"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Package, Truck, ChevronRight } from "lucide-react";
import type { CampaignCreatorWithRelation } from "@/types/campaign";

const PRIMARY = "#4ECDC4";
const PRIMARY_LIGHT = "#e8f8f7";

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
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: `2px solid ${confirmed ? PRIMARY + "40" : "#fca5a5"}` }}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{
          background: confirmed
            ? `linear-gradient(135deg, ${PRIMARY_LIGHT}, #e8f0fa)`
            : `linear-gradient(135deg, #fee2e2, #fecaca)`,
          borderBottom: `1px solid ${confirmed ? PRIMARY + "40" : "#fca5a5"}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: confirmed ? PRIMARY : "#dc2626" }}
          >
            <Truck size={22} color="#fff" />
          </div>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-[#4A4A4A]">
              {confirmed ? "จัดส่งเรียบร้อยแล้ว" : "จัดการการจัดส่งสินค้า"}
            </div>
            <div className="text-sm text-[#8a90a3] mt-0.5">
              ส่งสินค้าให้ครีเอเตอร์ {creatorsCount} คน
            </div>
          </div>
          {/* CTA in header */}
          {isDomestic ? (
            confirmed ? (
              <div
                className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px]"
                style={{ background: PRIMARY_LIGHT, color: "#0d9488", border: `1px solid ${PRIMARY}30` }}
              >
                <CheckCircle size={16} />
                จัดส่งเรียบร้อย
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px] text-white transition-opacity disabled:opacity-70"
                style={{ background: PRIMARY, border: "none" }}
              >
                <CheckCircle size={16} />
                {loading ? "กำลังบันทึก..." : "ยืนยันจัดส่งเรียบร้อย"}
              </button>
            )
          ) : (
            <a
              href="https://connex.com/shipments"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-[18px] py-2.5 rounded-xl font-bold text-[15px] text-white no-underline"
              style={{ background: "#dc2626" }}
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
        <div
          className="flex flex-col rounded-xl overflow-hidden"
          style={{ gap: 1, background: "#e8ecf0" }}
        >
          {creators.slice(0, 5).map((cc) => (
            <div key={cc.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 relative overflow-hidden"
                style={{ background: PRIMARY_LIGHT }}
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
                  <span className="text-[#8a90a3] text-sm font-medium">{cc.creator.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] text-[#4A4A4A]">{cc.creator.name}</div>
                <div className="text-[13px] text-[#8a90a3]">{cc.creator.niche}</div>
              </div>
              {confirmed ? (
                <div
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold"
                  style={{ background: PRIMARY_LIGHT, color: "#0d9488" }}
                >
                  <CheckCircle size={13} />
                  จัดส่งแล้ว
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold"
                  style={{ background: "#fef3c7", color: "#b45309" }}
                >
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
