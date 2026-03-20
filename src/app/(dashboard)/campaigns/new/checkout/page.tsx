"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Building2, Lock } from "lucide-react";
import { SAMPLE_CREATOR_AVATARS, STATIC_CHECKOUT_DATA } from "@/lib/constants";
import Link from "next/link";

const { packageName, numCreators, numPosts, duration, campaignType, basePrice, vatRate, serviceFeeRate } =
  STATIC_CHECKOUT_DATA;

const vat = Math.round(basePrice * vatRate);
const serviceFee = Math.round(basePrice * serviceFeeRate);
const total = basePrice + vat + serviceFee;

export default function CheckoutPage() {
  const [showAltPayment, setShowAltPayment] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-240">
          <Link href="/campaigns/new/creators">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]">
              <ArrowLeft size={16} />
              กลับไปเลือกครีเอเตอร์
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">สรุปรายการ & ชำระเงิน</h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">ตรวจสอบรายการแล้วชำระเงิน</p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Card 1 — Package Details */}
            <div className="rounded-xl border border-[#4ECDC420] bg-gradient-to-r from-[#e8f8f7] to-[#e8f0fa] p-5">
              <div className="mb-4 text-base font-bold text-[#4A4A4A]">รายละเอียดแพ็กเกจ</div>
              <div className="flex flex-col gap-2.5">
                {[
                  ["แพ็กเกจ", packageName],
                  ["ระยะเวลา", duration],
                  ["จำนวนโพสต์", `${numPosts} โพสต์`],
                  ["ประเภทแคมเปญ", campaignType],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#8a90a3]">{label}</span>
                    <span className="text-sm font-semibold text-[#4A4A4A]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Selected Creators */}
            <div className="rounded-xl border-2 border-[#e8ecf0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base font-bold text-[#4A4A4A]">ครีเอเตอร์ที่เลือก</span>
                <span className="rounded-full bg-[#e8f8f7] px-2.5 py-0.5 text-xs font-bold text-[#4ECDC4]">
                  {numCreators} คน
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_CREATOR_AVATARS.slice(0, numCreators).map((cr, i) => (
                  <div
                    key={i}
                    title={cr.name}
                    className="flex size-10 items-center justify-center rounded-full border-2 border-[#4ECDC440] bg-[#e8f8f7] text-xl"
                  >
                    {cr.avatar}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — Price Breakdown */}
            <div className="rounded-xl border-2 border-[#e8ecf0] bg-white p-5">
              <div className="mb-4 text-base font-bold text-[#4A4A4A]">รายละเอียดราคา</div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">ค่าแพ็กเกจ</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">฿{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">VAT (7%)</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">฿{vat.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">ค่าบริการ (3%)</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">฿{serviceFee.toLocaleString()}</span>
                </div>
              </div>
              <div className="my-4 h-[2px] bg-[#e8ecf0]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#4A4A4A]">รวมทั้งหมด</span>
                <span className="font-extrabold text-[#4ECDC4]" style={{ fontSize: "26px" }}>
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Card 4 — QR Payment */}
            <div className="rounded-2xl bg-gradient-to-br from-[#4A4A4A] to-[#333] p-7 text-white">
              {showAltPayment ? (
                <div>
                  <div className="mb-5 text-[18px] font-bold">เลือกวิธีชำระเงิน</div>
                  <div className="mb-3 flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/20">
                    <CreditCard size={22} />
                    <div>
                      <div className="text-sm font-semibold">บัตรเครดิต / เดบิต</div>
                      <div className="text-xs text-[#bbb]">Visa, Mastercard, JCB</div>
                    </div>
                  </div>
                  <div className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/20">
                    <Building2 size={22} />
                    <div>
                      <div className="text-sm font-semibold">โอนผ่านธนาคาร</div>
                      <div className="text-xs text-[#bbb]">Internet Banking</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAltPayment(false)}
                    className="cursor-pointer border-none bg-transparent text-sm text-[#4A90D9]"
                  >
                    ← กลับไปสแกน QR
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-[22px] font-bold">สแกนเพื่อชำระเงิน</div>
                  <div className="mb-5 text-[14px] text-[#bbb]">ใช้แอปธนาคารสแกน QR Code</div>

                  {/* QR placeholder */}
                  <div
                    aria-label="QR Code"
                    className="mx-auto mb-4 flex size-[180px] items-center justify-center rounded-xl bg-white"
                  >
                    <Lock size={48} color="#4A4A4A" />
                  </div>

                  <div className="mb-5 text-center text-[13px] text-[#bbb]">รหัส: #KG-2026-7842</div>

                  {/* Escrow notice */}
                  <div className="mb-5 rounded-xl bg-white/10 p-3 text-[13px]">
                    🔒 ระบบ Escrow — เงินจะโอนให้ครีเอเตอร์เมื่อแคมเปญเสร็จสิ้น
                  </div>

                  <button
                    onClick={() => setShowAltPayment(true)}
                    className="cursor-pointer border-none bg-transparent text-sm text-[#4A90D9]"
                  >
                    เปลี่ยนวิธีชำระเงิน
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <button className="w-full cursor-pointer rounded-xl border-none bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 text-base font-bold text-white">
              ✓ ยืนยันการชำระเงิน
            </button>

            {/* Terms */}
            <p className="m-0 text-center text-[12px] text-[#8a90a3]">
              เมื่อกดยืนยัน ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
