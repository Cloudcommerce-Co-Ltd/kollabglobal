"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Target } from "lucide-react";
import Link from "next/link";
import { useCampaignStore } from "@/stores/campaign-store";
import { Creator } from "@/types";
import { useRouter } from 'next/navigation';

export default function SelectCreatorsPage() {
  const router = useRouter();
  const { packageData, selectedCreatorsData, setCreators } = useCampaignStore();

  const maxCreators = packageData?.numCreators ?? 10;

  const [selectedIds, setSelectedIds] = useState<string[]>(
    (selectedCreatorsData && selectedCreatorsData.length > 0) ?
      selectedCreatorsData.map((c: Creator) => c.id) : []
  );
  const [displayCreators, setDisplayCreators] = useState<Creator[]>([]);

  const CreatorCard = ({ creator, isSelected, isDisabled }:
    { creator: Creator, isSelected: boolean, isDisabled: boolean }) => {
    return (
      <div
        onClick={() => !isDisabled && toggleCreator(creator.id)}
        className={`relative cursor-pointer flex flex-col items-center rounded-xl border-2 bg-white p-3.5 transition-all ${
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
          <div className="flex size-11 items-center justify-center rounded-full text-[40px] m-1.5">
            {creator.avatar}
          </div>
          <span className="absolute bottom-0 right-0 flex size-4.25 items-center justify-center rounded-full text-[18px]">
            {creator.countryFlag}
          </span>
        </div>

        <div className="text-sm font-semibold text-[#4A4A4A]">{creator.name}</div>
        <div className="mb-2 text-xs text-[#8a90a3]">{creator.niche}</div>

        <div className="w-full flex flex-col gap-1">
          <span className="w-full flex justify-between rounded-[5px] bg-[#e8f8f7] px-1.5 py-0.5 text-[10px] font-semibold text-[#4ECDC4]">
            <p>Engagement</p>
            <p>{creator.engagement}</p>
          </span>
          <span className="w-full flex justify-between rounded-[5px] bg-[#e8f0fa] px-1.5 py-0.5 text-[10px] font-semibold text-[#4A90D9]">
            <p>Reach</p>
            <p>{creator.reach}</p>
          </span>
        </div>
      </div>
    );
}

  useEffect(() => {
    fetch("/api/creators")
      .then((r) => r.json())
      .then((data: Creator[]) => {
        setDisplayCreators(data);
        setSelectedIds(data.slice(0, maxCreators).map((c) => c.id));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCreator(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : selectedIds.length < maxCreators ? [...selectedIds, id] : selectedIds;
    setSelectedIds(next);
    setCreators(displayCreators.filter((c) => next.includes(c.id)));
  }

  const isComplete = selectedIds.length === maxCreators;

  function handleNext() {
    if (!isComplete) return;
    setCreators(displayCreators.filter((c) => selectedIds.includes(c.id)));
    router.push("/campaigns/new/checkout");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-265">
          <Link href="/campaigns/new/package">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]">
              <ArrowLeft size={16} />
              กลับไปเลือกแพ็กเกจ
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">เลือกครีเอเตอร์</h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">
            {selectedIds.length}/{maxCreators} คนที่เลือก • เลือกได้สูงสุด {maxCreators} คน
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-265 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* AI Recommendation Banner */}
        <div className="mb-6 rounded-xl border border-[#4ECDC420] bg-linear-to-r from-[#e8f8f7] to-[#f0ebf8] p-4">
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
            {displayCreators.slice(0, 10).map((creator, i) => {
              const isSelected = selectedIds.includes(creator.id);
              const isDisabled = !isSelected && selectedIds.length >= maxCreators;
              return (
                <CreatorCard
                  key={i}
                  creator={creator}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                />
              );
            })}
          </div>
        </div>

        {/* Backup Section */}
        <div>
          <div className="flex justify-between">
            <div className="mb-3 flex gap-2">
              <span className="h-fit rounded-[8px] bg-[#e8ecf0] px-2.5 py-0.5 text-xs font-bold text-[#8a90a3]">สำรอง</span>
              <span className="text-sm font-semibold text-[#4A4A4A]">ตัวเลือกอื่น</span>
            </div>

            {/* Yellow tip box */}
            <div className="mb-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-xs text-[#92400e]">
              ครีเอเตอร์สำรองจะถูกเรียกใช้งานโดยอัตโนมัติ หากครีเอเตอร์หลักไม่ตอบรับงาน
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayCreators.slice(10, 15).map((creator, offset) => {
              const i = 10 + offset;
              const isSelected = selectedIds.includes(creator.id);
              const isDisabled = !isSelected && selectedIds.length >= maxCreators;
              return (
                <CreatorCard
                  key={i}
                  creator={creator}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e8ecf0] bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-265 items-center justify-between">
          <div className="text-sm font-semibold text-[#8a90a3]">
            {isComplete ? (
              <span className="text-[#4ECDC4]">✓ เลือกครบจำนวนแล้ว</span>
            ) : (
              `เลือกได้อีก ${maxCreators - selectedIds.length} คน`
            )}
          </div>
          <button
            disabled={!isComplete}
            onClick={handleNext}
            className={`rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all ${
              isComplete ? "cursor-pointer bg-[#4ECDC4]" : "cursor-not-allowed bg-[#ccc]"
            }`}
          >
            ถัดไป — สรุปรายการ
          </button>
        </div>
      </div>
    </div>
  );
}
