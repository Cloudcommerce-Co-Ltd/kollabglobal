"use client";

import { useState } from "react";
import { ArrowLeft, Check, Target } from "lucide-react";
import { SAMPLE_CREATOR_AVATARS } from "@/lib/constants";
import Link from "next/link";

export default function SelectCreatorsPage() {
  const initialSelected = new Set(
    SAMPLE_CREATOR_AVATARS.slice(0, 10).map((_, i) => i)
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(initialSelected);

  function toggleCreator(index: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < 10) {
        next.add(index);
      }
      return next;
    });
  }

  const isComplete = selectedIds.size === 10;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1060px]">
          <Link href="/campaigns/new/package">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]">
              <ArrowLeft size={16} />
              กลับไปเลือกแพ็กเกจ
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">เลือกครีเอเตอร์</h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">
            {selectedIds.size}/10 คนที่เลือก • เลือกได้สูงสุด 10 คน
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1060px] px-4 pb-[80px] pt-6 sm:px-6 lg:px-8">
        {/* AI Recommendation Banner */}
        <div className="mb-6 rounded-xl border border-[#4ECDC420] bg-gradient-to-r from-[#e8f8f7] to-[#f0ebf8] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#4ECDC4]">
              <Target size={18} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4A4A4A]">ทำไมถึงแนะนำครีเอเตอร์เหล่านี้?</div>
              <div className="mt-0.5 text-xs text-[#8a90a3]">
                AI วิเคราะห์จากกลุ่มเป้าหมาย ประเภทสินค้า และตลาดที่คุณเลือก
                เพื่อคัดสรรครีเอเตอร์ที่มีผลลัพธ์ดีที่สุดสำหรับแคมเปญของคุณ
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-[8px] bg-[#4ECDC4] px-2.5 py-0.5 text-xs font-bold text-white">แนะนำ</span>
            <span className="text-sm font-semibold text-[#4A4A4A]">Top Picks</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {SAMPLE_CREATOR_AVATARS.slice(0, 10).map((creator, i) => {
              const isSelected = selectedIds.has(i);
              const isDisabled = !isSelected && selectedIds.size >= 10;
              return (
                <div
                  key={i}
                  onClick={() => !isDisabled && toggleCreator(i)}
                  className={`relative cursor-pointer rounded-xl border-2 bg-white p-3.5 transition-all ${
                    isSelected ? "border-[#4ECDC4]" : "border-[#e8ecf0]"
                  } ${isDisabled ? "opacity-45" : ""}`}
                >
                  {/* Checkmark */}
                  <div
                    className={`absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#4ECDC4] bg-[#4ECDC4]" : "border-[#e8ecf0] bg-white"
                    }`}
                  >
                    {isSelected && <Check size={11} color="#fff" />}
                  </div>

                  {/* Avatar */}
                  <div className="relative mb-2 inline-block">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#e8f8f7] text-[26px]">
                      {creator.avatar}
                    </div>
                    <span className="absolute bottom-0 right-0 flex size-[17px] items-center justify-center rounded-full border border-white bg-white text-[10px]">
                      {creator.flag}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-[#4A4A4A]">{creator.name}</div>
                  <div className="mb-2 text-xs text-[#8a90a3]">{creator.niche}</div>

                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-[5px] bg-[#e8f8f7] px-1.5 py-0.5 text-[10px] font-semibold text-[#4ECDC4]">
                      {creator.eng}
                    </span>
                    <span className="rounded-[5px] bg-[#e8f0fa] px-1.5 py-0.5 text-[10px] font-semibold text-[#4A90D9]">
                      {creator.reach}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backup Section */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-[8px] bg-[#e8ecf0] px-2.5 py-0.5 text-xs font-bold text-[#8a90a3]">สำรอง</span>
            <span className="text-sm font-semibold text-[#4A4A4A]">ตัวเลือกอื่น</span>
          </div>

          {/* Yellow tip box */}
          <div className="mb-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-xs text-[#92400e]">
            ครีเอเตอร์สำรองจะถูกเรียกใช้งานโดยอัตโนมัติ หากครีเอเตอร์หลักไม่ตอบรับงาน
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {SAMPLE_CREATOR_AVATARS.slice(10, 15).map((creator, offset) => {
              const i = 10 + offset;
              const isSelected = selectedIds.has(i);
              const isDisabled = !isSelected && selectedIds.size >= 10;
              return (
                <div
                  key={i}
                  onClick={() => !isDisabled && toggleCreator(i)}
                  className={`relative cursor-pointer rounded-xl border-2 bg-white p-3.5 transition-all ${
                    isSelected ? "border-[#4ECDC4]" : "border-[#e8ecf0]"
                  } ${isDisabled ? "opacity-45" : ""}`}
                >
                  <div
                    className={`absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#4ECDC4] bg-[#4ECDC4]" : "border-[#e8ecf0] bg-white"
                    }`}
                  >
                    {isSelected && <Check size={11} color="#fff" />}
                  </div>

                  <div className="relative mb-2 inline-block">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#e8f8f7] text-[26px]">
                      {creator.avatar}
                    </div>
                    <span className="absolute bottom-0 right-0 flex size-[17px] items-center justify-center rounded-full border border-white bg-white text-[10px]">
                      {creator.flag}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-[#4A4A4A]">{creator.name}</div>
                  <div className="mb-2 text-xs text-[#8a90a3]">{creator.niche}</div>

                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-[5px] bg-[#e8f8f7] px-1.5 py-0.5 text-[10px] font-semibold text-[#4ECDC4]">
                      {creator.eng}
                    </span>
                    <span className="rounded-[5px] bg-[#e8f0fa] px-1.5 py-0.5 text-[10px] font-semibold text-[#4A90D9]">
                      {creator.reach}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e8ecf0] bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1060px] items-center justify-between">
          <div className="text-sm font-semibold text-[#8a90a3]">
            {isComplete ? (
              <span className="text-[#4ECDC4]">✓ เลือกครบจำนวนแล้ว</span>
            ) : (
              `เลือกได้อีก ${10 - selectedIds.size} คน`
            )}
          </div>
          <Link href="/campaigns/new/checkout">
            <button
              className={`rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all ${
                selectedIds.size > 0 ? "cursor-pointer bg-[#4ECDC4]" : "cursor-not-allowed bg-[#ccc]"
              }`}
            >
              ถัดไป — สรุปรายการ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
