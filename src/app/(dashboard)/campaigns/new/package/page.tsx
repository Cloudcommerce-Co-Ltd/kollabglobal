"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useCampaignStore } from "@/stores/campaign-store";
import { PACKAGE_EXTRAS, SAMPLE_CREATOR_AVATARS } from "@/lib/constants";
import { PlatformIcon } from "@/components/icons/platform-icons";
import type { Package } from "@/types";

export default function SelectPackagePage() {
  const router = useRouter();
  const { countryId, packageId, setPackage, nextStep, prevStep, goToStep } =
    useCampaignStore();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(packageId);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    goToStep(3);
  }, [goToStep]);

  useEffect(() => {
    if (!countryId) {
      router.replace("/campaigns/new/country");
      return;
    }
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data: Package[]) => {
        setPackages(data);
        if (!packageId) {
          const popular = data.find((p) => p.badge !== null);
          if (popular) {
            setSelected(popular.id);
            setPackage(popular.id);
          }
        }
        setLoading(false);
      });
  }, [countryId, packageId, router, setPackage]);

  function handleSelect(id: string) {
    setSelected(id);
    setPackage(id);
  }

  function handleNext() {
    if (!selected) return;
    nextStep();
    router.push("/campaigns/new/creators");
  }

  function handleBack() {
    prevStep();
    router.push("/campaigns/new/product");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Page header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1060px]">
          <button
            onClick={handleBack}
            className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]"
          >
            <ArrowLeft size={16} />
            กลับไปเพิ่มสินค้า / บริการ
          </button>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">เลือกแพ็กเกจ</h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">ยิ่งเลือกครีเอเตอร์เยอะ ยิ่งครอบคลุมทุก platform</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#8a90a3]">กำลังโหลด...</div>
      ) : (
        <div className="mx-auto max-w-[1060px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {/* Package cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map((pkg) => {
              const isSelected = selected === pkg.id;
              const extras = PACKAGE_EXTRAS[pkg.id] ?? { platforms: [], deliverables: [] };
              const total = Math.round(pkg.numCreators * pkg.pricePerCreator * (1 - pkg.discountPct / 100));
              const avatarCount = Math.min(pkg.numCreators, 8);

              return (
                <div
                  key={pkg.id}
                  onClick={() => handleSelect(pkg.id)}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border-2 px-5 pb-[18px] pt-[22px] transition-all ${
                    isSelected
                      ? "border-[#4ECDC4] shadow-[0_4px_24px_#4ECDC420]"
                      : "border-[#e8ecf0]"
                  } bg-white`}
                >
                  {/* Popular badge */}
                  {pkg.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-[#4ECDC4] px-3.5 py-[3px] text-xs font-bold text-white">
                      {pkg.badge}
                    </div>
                  )}

                  {/* Name + radio */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`text-xl font-extrabold ${isSelected ? "text-[#4ECDC4]" : "text-[#4A4A4A]"}`}>
                      {pkg.name}
                    </div>
                    <div className={`flex size-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#4ECDC4] bg-[#4ECDC4]" : "border-[#e8ecf0] bg-transparent"
                    }`}>
                      {isSelected && <Check size={11} color="#fff" />}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-[18px]">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8a90a3]">
                      ราคา / ครีเอเตอร์
                    </div>
                    <div className="mb-1.5 flex items-baseline gap-1">
                      <span className={`text-[24px] font-extrabold sm:text-[32px] ${isSelected ? "text-[#4ECDC4]" : "text-[#4A4A4A]"}`}>
                        ฿{pkg.pricePerCreator.toLocaleString()}
                      </span>
                      <span className="text-[13px] text-[#8a90a3]">/คน</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8a90a3]">
                        {pkg.numCreators} ครีเอเตอร์ รวม{" "}
                        <b className={isSelected ? "text-[#4ECDC4]" : "text-[#4A4A4A]"}>
                          ฿{total.toLocaleString()}
                        </b>
                      </span>
                      {pkg.discountPct > 0 && (
                        <span className="rounded-[6px] bg-[#dcfce7] px-[7px] py-[2px] text-xs font-bold text-[#16a34a]">
                          ประหยัด {pkg.discountPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 h-px bg-[#e8ecf0]" />

                  {/* Platforms */}
                  <div className="mb-3.5">
                    <div className="mb-2.5 text-xs font-semibold text-[#8a90a3]">โพสต์ใน</div>
                    <div className="flex items-center gap-2">
                      {extras.platforms.map((pid, pi) => (
                        <div key={pid} className="flex items-center gap-1.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#f3f4f6]">
                            <PlatformIcon platform={pid} size={18} />
                          </div>
                          {pi < extras.platforms.length - 1 && (
                            <span className="text-[15px] text-[#e8ecf0]">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-col gap-[3px]">
                      {extras.deliverables.map((d, di) => (
                        <div key={di} className="flex items-center gap-[5px] text-xs text-[#8a90a3]">
                          <div className="size-[3px] shrink-0 rounded-full bg-[#8a90a3]" />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creator avatars */}
                  <div className="mb-3.5">
                    <div className="mb-[7px] text-xs text-[#8a90a3]">ครีเอเตอร์ตัวอย่าง</div>
                    <div className="flex flex-wrap gap-0.5">
                      {SAMPLE_CREATOR_AVATARS.slice(0, avatarCount).map((cr, i) => (
                        <div
                          key={i}
                          className="relative"
                          onMouseEnter={() => setHover(`${pkg.id}-${i}`)}
                          onMouseLeave={() => setHover(null)}
                        >
                          <div
                            className={`flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#e8f8f7] text-base transition-transform ${
                              hover === `${pkg.id}-${i}` ? "scale-[1.18]" : "scale-100"
                            }`}
                          >
                            {cr.avatar}
                          </div>
                          {hover === `${pkg.id}-${i}` && (
                            <div className="absolute bottom-9 left-1/2 z-50 min-w-[150px] -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-[#4A4A4A] px-[11px] py-2 text-white">
                              <div className="mb-[3px] flex items-center gap-[5px]">
                                <span className="text-base">{cr.avatar}</span>
                                <span className="text-xs">{cr.flag}</span>
                                <span className="text-xs font-semibold">{cr.name}</span>
                              </div>
                              <div className="mb-[3px] text-[11px] text-[#aaa]">{cr.niche}</div>
                              <div className="flex gap-2 text-[11px]">
                                <span>Eng: <b className="text-[#4ECDC4]">{cr.eng}</b></span>
                                <span>Reach: <b className="text-[#4A90D9]">{cr.reach}</b></span>
                              </div>
                              <div className="absolute -bottom-[5px] left-1/2 size-[9px] -translate-x-1/2 rotate-45 bg-[#4A4A4A]" />
                            </div>
                          )}
                        </div>
                      ))}
                      {pkg.numCreators > 8 && (
                        <div className="flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#e8ecf0] text-[11px] font-bold text-[#8a90a3]">
                          +{pkg.numCreators - 8}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-1.5 border-t border-[#e8ecf0] pt-3">
                    {[
                      ["Reach", pkg.estReach, "text-[#4A90D9]"],
                      ["Engagement", pkg.estEngagement, "text-[#4ECDC4]"],
                    ].map(([label, value, color]) => (
                      <div key={label} className="text-center">
                        <div className="mb-0.5 text-[9px] font-semibold uppercase text-[#8a90a3]">{label}</div>
                        <div className={`text-xs font-bold ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex justify-end">
            <button
              disabled={!selected}
              onClick={handleNext}
              className={`w-full rounded-xl border-none px-8 py-3.5 text-[15px] font-semibold text-white transition-all sm:w-auto ${
                selected ? "cursor-pointer bg-[#4ECDC4]" : "cursor-not-allowed bg-[#ccc]"
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
