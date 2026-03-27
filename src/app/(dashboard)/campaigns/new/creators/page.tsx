'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCampaignStore } from '@/stores/campaign-store';
import { Creator } from '@/types';
import { useRouter } from 'next/navigation';

function CreatorCard({
  creator,
  isSelected,
  isDisabled,
  onToggle,
}: {
  creator: Creator;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string) => void;
}) {
  return (
      <div
        onClick={() => !isDisabled && onToggle(creator.id)}
        className={`relative cursor-pointer flex flex-col items-center rounded-xl border-2 bg-white p-3.5 transition-all ${
          isSelected ? 'border-brand' : 'border-border-ui'
        } ${isDisabled ? 'opacity-45' : ''}`}
      >
        {/* Checkmark */}
        <div
          className={`absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full border-2 ${
            isSelected
              ? 'border-brand bg-brand'
              : 'border-border-ui bg-white'
          }`}
        >
          {isSelected && <Check size={11} color="#fff" />}
        </div>

        {/* Avatar */}
        <div className="relative mb-2 inline-block">
          <div className="relative m-1.5 size-11 overflow-hidden rounded-full bg-brand-light flex items-center justify-center">
            <span className="text-sm font-bold text-brand">{creator.name.charAt(0)}</span>
            {creator.avatar && (
              <Image
                src={creator.avatar}
                alt={creator.name}
                fill
                className="rounded-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                unoptimized
              />
            )}
          </div>
          <span className="absolute bottom-0 right-0 flex size-4.25 items-center justify-center rounded-full text-[18px]">
            {creator.countryFlag}
          </span>
        </div>

        <div className="text-sm font-semibold text-dark mb-2">
          {creator.name}
        </div>

        <div className="w-full flex flex-col gap-1">
          <span className="w-full flex justify-between rounded-[5px] bg-brand-light px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            <p>Engagement</p>
            <p>{creator.engagement}</p>
          </span>
          <span className="w-full flex justify-between rounded-[5px] bg-secondary-brand-light px-1.5 py-0.5 text-[10px] font-semibold text-secondary-brand">
            <p>Reach</p>
            <p>{creator.reach}</p>
          </span>
        </div>
      </div>
    );
}

export default function SelectCreatorsPage() {
  const router = useRouter();
  const { packageData, selectedCreatorsData, setCreators } = useCampaignStore();

  const maxCreators = packageData?.numCreators ?? 10;

  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedCreatorsData && selectedCreatorsData.length > 0
      ? selectedCreatorsData.map((c: Creator) => c.id)
      : [],
  );
  const [mainCreators, setMainCreators] = useState<Creator[]>([]);
  const [backupCreators, setBackupCreators] = useState<Creator[]>([]);

  useEffect(() => {
    fetch('/api/creators')
      .then(r => r.json())
      .then((data: Creator[]) => {
        const main = data.filter((c: Creator) => !c.isBackup);
        const backup = data.filter((c: Creator) => c.isBackup);
        setMainCreators(main);
        setBackupCreators(backup);
        setSelectedIds(prev =>
          prev.length > 0 ? prev : main.slice(0, maxCreators).map(c => c.id),
        );
      });
  }, [maxCreators, packageData]);

  const allCreators = [...mainCreators, ...backupCreators];

  function toggleCreator(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : selectedIds.length < maxCreators
        ? [...selectedIds, id]
        : selectedIds;
    setSelectedIds(next);
    setCreators(allCreators.filter(c => next.includes(c.id)));
  }

  const isComplete = selectedIds.length === maxCreators;

  function handleNext() {
    if (!isComplete) return;
    setCreators(allCreators.filter(c => selectedIds.includes(c.id)));
    router.push('/campaigns/new/checkout');
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-265">
          <Link href="/campaigns/new/package">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-muted-text">
              <ArrowLeft size={16} />
              กลับไปเลือกแพ็กเกจ
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-dark sm:text-[26px]">
            เลือกครีเอเตอร์
          </h1>
          <p className="m-0 mt-0.5 text-sm text-muted-text">
            {selectedIds.length}/{maxCreators} คนที่เลือก • เลือกได้สูงสุด{' '}
            {maxCreators} คน
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-265 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Recommended Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-[8px] bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
              แนะนำ
            </span>
            <span className="text-sm font-semibold text-dark">
              Top Picks
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mainCreators.slice(0, maxCreators).map((creator, i) => {
              const isSelected = selectedIds.includes(creator.id);
              const isDisabled =
                !isSelected && selectedIds.length >= maxCreators;
              return (
                <CreatorCard
                  key={i}
                  creator={creator}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onToggle={toggleCreator}
                />
              );
            })}
          </div>
        </div>

        {/* Backup Section */}
        {backupCreators.length > 0 && (
          <div>
            <div className="flex justify-between">
              <div className="mb-3 flex gap-2">
                <span className="h-fit rounded-[8px] bg-border-ui px-2.5 py-0.5 text-xs font-bold text-muted-text">
                  สำรอง
                </span>
                <span className="text-sm font-semibold text-dark">
                  ตัวเลือกอื่น
                </span>
              </div>

              {/* Yellow tip box */}
              <div className="mb-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-xs text-[#92400e]">
                ครีเอเตอร์สำรองจะถูกเรียกใช้งานโดยอัตโนมัติ
                หากครีเอเตอร์หลักไม่ตอบรับงาน
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {backupCreators.map((creator) => {
                const isSelected = selectedIds.includes(creator.id);
                const isDisabled =
                  !isSelected && selectedIds.length >= maxCreators;
                return (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onToggle={toggleCreator}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border-ui bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-265 items-center justify-end gap-5">
          <div className="text-sm font-semibold text-muted-text">
            {isComplete ? (
              <span className="text-brand">✓ เลือกครบจำนวนแล้ว</span>
            ) : (
              <p>
                จำนวนครีเอเตอร์ {selectedIds.length}/{maxCreators} คน
              </p>
            )}
          </div>
          <button
            disabled={!isComplete}
            onClick={handleNext}
            className={`rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white transition-all ${
              isComplete
                ? 'cursor-pointer bg-brand'
                : 'cursor-not-allowed bg-[#ccc]'
            }`}
          >
            ถัดไป — สรุปรายการ
          </button>
        </div>
      </div>
    </div>
  );
}
