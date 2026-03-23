'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Image from 'next/image';
import { useCampaignStore } from '@/stores/campaign-store';
import { SAMPLE_CREATOR_AVATARS } from '@/lib/constants';
import { PlatformIcon } from '@/components/icons/platform-icons';
import { calculatePackageTotal } from '@/lib/package-utils';
import type { Creator, Package } from '@/types';

export default function SelectPackagePage() {
  const router = useRouter();
  const { countryData, packageData, setPackage } =
    useCampaignStore();

  const [packages, setPackages] = useState<Package[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(packageData?.id ?? null);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    if (!countryData) return;
    Promise.all([
      fetch('/api/packages').then(r => r.json()),
      fetch('/api/creators').then(r => r.json()),
    ]).then(([pkgData, crData]: [Package[], Creator[]]) => {
      setPackages(pkgData);
      setCreators(crData.filter(c => !c.isBackup));
      if (!packageData) {
        const popular = pkgData.find(p => p.badge !== null);
        if (popular) {
          setSelected(popular.id);
          setPackage(popular);
        }
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData, setPackage]);

  function handleSelect(data: Package) {
    setSelected(data.id);
    setPackage(data);
  }

  function handleNext() {
    if (!selected) return;
    router.push('/campaigns/new/creators');
  }

  function handleBack() {
    router.push('/campaigns/new/product');
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Page header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-265">
          <button
            onClick={handleBack}
            className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]"
          >
            <ArrowLeft size={16} />
            กลับไปเพิ่มสินค้า / บริการ
          </button>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">
            เลือกแพ็กเกจ
          </h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">
            ยิ่งเลือกครีเอเตอร์เยอะ ยิ่งครอบคลุมทุก platform
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#8a90a3]">กำลังโหลด...</div>
      ) : (
        <div className="mx-auto max-w-265 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {/* Package cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map(pkg => {
              const isSelected = selected === pkg.id;
              const total = calculatePackageTotal(pkg);
              const avatarCount = Math.min(pkg.numCreators, 7);
              const creatorDesc = pkg.id === 1
                ? `${pkg.numCreators} ครีเอเตอร์`
                : `${pkg.numCreators} ครีเอเตอร์ · ไทย+ต่างชาติ`;

              return (
                <div
                  key={pkg.id}
                  onClick={() => handleSelect(pkg)}
                  className={`relative flex cursor-pointer flex-col overflow-hidden rounded-[18px] border-2 transition-all ${
                    isSelected
                      ? 'border-[#4ECDC4] shadow-[0_4px_24px_#4ECDC420]'
                      : 'border-[#e8ecf0]'
                  } bg-white`}
                >
                  {/* Recommended badge — flat-top tab */}
                  {pkg.badge && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 whitespace-nowrap rounded-b-[12px] rounded-t-none bg-[#4ECDC4] px-4.5 py-1 text-[11px] font-bold text-white">
                      {pkg.badge}
                    </div>
                  )}

                  {/* Radio indicator */}
                  <div
                    className={`absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-[#4ECDC4] bg-[#4ECDC4]'
                        : 'border-[#e8ecf0] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={11} color="#fff" />}
                  </div>

                  {/* Plan name + tagline */}
                  <div
                    className={`border-b border-[#e8ecf0] px-4.5 pb-4.5 pt-6`}
                  >
                    <div
                      className={`pr-7 text-lg font-extrabold ${
                        isSelected ? 'text-[#4ECDC4]' : 'text-[#4A4A4A]'
                      }`}
                    >
                      {pkg.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#8a90a3]">
                      {pkg.tagline}
                    </div>
                  </div>

                  {/* Price — total price prominent */}
                  <div className="border-b border-[#e8ecf0] px-4.5 py-4.5">
                    <div
                      className={`text-[28px] font-extrabold leading-none sm:text-[34px] ${
                        isSelected ? 'text-[#4ECDC4]' : 'text-[#4A4A4A]'
                      }`}
                    >
                      ฿{total.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[13px] text-[#8a90a3]">
                      {creatorDesc}
                    </div>
                  </div>

                  {/* CPM strip */}
                  <div
                    className={`flex items-center justify-between border-b px-4.5 py-2 ${
                      isSelected
                        ? 'border-[#4ECDC430] bg-[#4ECDC412]'
                        : 'border-[#e8ecf0] bg-[#f8fffe]'
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-[#4ECDC4]' : 'text-[#0a7a62]'
                        }`}
                      >
                        CPM ถูกกว่า Google
                      </div>
                      <div className="mt-px text-[11px] text-[#8a90a3]">
                        {pkg.cpmLabel}
                      </div>
                    </div>
                    <div
                      className={`text-lg font-extrabold ${
                        isSelected ? 'text-[#4ECDC4]' : 'text-[#0a7a62]'
                      }`}
                    >
                      {pkg.cpmSavings}
                    </div>
                  </div>

                  {/* Platforms + deliverables */}
                  <div className="h-full border-b border-[#e8ecf0] px-4.5 py-4.5">
                    <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8a90a3]">
                      โพสต์ใน
                    </div>
                    <div className="mb-2.5 flex items-center gap-1.5">
                      {pkg.platforms.map((pid, pi) => (
                        <div key={pid} className="flex items-center gap-1.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#f3f4f6]">
                            <PlatformIcon platform={pid} size={18} />
                          </div>
                          {pi < pkg.platforms.length - 1 && (
                            <span className="text-[15px] text-[#e8ecf0]">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      {pkg.deliverables.map((d, di) => (
                        <div
                          key={di}
                          className="flex items-center gap-1.25 text-[13px] text-[#5a5e72]"
                        >
                          <span className="font-bold text-[#4ECDC4]">·</span>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Creator avatars */}
                  <div className="border-b border-[#e8ecf0] px-4.5 py-4.5">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8a90a3]">
                      ครีเอเตอร์ตัวอย่าง
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {creators.slice(0, avatarCount).map(
                        (cr, i) => (
                          <div
                            key={cr.id}
                            className="relative"
                            onMouseEnter={() => setHover(`${pkg.id}-${i}`)}
                            onMouseLeave={() => setHover(null)}
                          >
                            <div
                              className={`relative flex size-7.5 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#e8f8f7] transition-transform ${
                                hover === `${pkg.id}-${i}`
                                  ? 'scale-[1.18]'
                                  : 'scale-100'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-[#4ECDC4]">{cr.name.charAt(0)}</span>
                              <Image
                                src={cr.avatar}
                                alt={cr.name}
                                fill
                                className="object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                unoptimized
                              />
                            </div>
                            {hover === `${pkg.id}-${i}` && (
                              <div className="absolute bottom-9 left-1/2 z-50 min-w-37.5 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-[#4A4A4A] px-2.75 py-2 text-white">
                                <div className="mb-0.75 flex items-center gap-1.25">
                                  <div className="relative flex size-4 items-center justify-center overflow-hidden rounded-full bg-[#e8f8f7]">
                                    <span className="text-[8px] font-bold text-[#4ECDC4]">{cr.name.charAt(0)}</span>
                                    <Image src={cr.avatar} alt={cr.name} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} unoptimized />
                                  </div>
                                  <span className="text-xs">{cr.countryFlag}</span>
                                  <span className="text-xs font-semibold">
                                    {cr.name}
                                  </span>
                                </div>
                                <div className="mb-0.75 text-[11px] text-[#aaa]">
                                  {cr.niche}
                                </div>
                                <div className="flex gap-2 text-[11px]">
                                  <span>
                                    Eng:{' '}
                                    <b className="text-[#4ECDC4]">{cr.engagement}</b>
                                  </span>
                                  <span>
                                    Reach:{' '}
                                    <b className="text-[#4A90D9]">{cr.reach}</b>
                                  </span>
                                </div>
                                <div className="absolute -bottom-1.25 left-1/2 size-2.25 -translate-x-1/2 rotate-45 bg-[#4A4A4A]" />
                              </div>
                            )}
                          </div>
                        ),
                      )}
                      {pkg.numCreators > 8 && (
                        <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#e8ecf0] text-[11px] font-bold text-[#8a90a3]">
                          +{pkg.numCreators - 7}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats footer */}
                  <div className="grid grid-cols-2 bg-[#f8fffe]">
                    <div className="border-r border-[#e8ecf0] px-4.5 py-3.5 text-center">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#8a90a3]">
                        Reach
                      </div>
                      <div className="text-[15px] font-extrabold text-[#4A4A4A]">
                        {pkg.estReach}
                      </div>
                    </div>
                    <div className="px-4.5 py-3.5 text-center">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#8a90a3]">
                        Engagement
                      </div>
                      <div className="text-[15px] font-extrabold text-[#4ECDC4]">
                        {pkg.estEngagement}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <p className="mb-5 text-center text-[11px] text-[#8a90a3]">
            * CPM คำนวณจาก reach กลาง (midpoint) | ราคา Google Ads อ้างอิงค่าเฉลี่ยตลาดไทย ใช้เพื่อการเปรียบเทียบ
          </p>

          {/* CTA */}
          <div className="flex justify-end">
            <button
              disabled={!selected}
              onClick={handleNext}
              className={`w-full rounded-xl border-none px-8 py-3.5 text-[15px] font-semibold text-white transition-all sm:w-auto ${
                selected
                  ? 'cursor-pointer bg-[#4ECDC4]'
                  : 'cursor-not-allowed bg-[#ccc]'
              }`}
            >
              ยืนยัน — เลือกครีเอเตอร์
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
