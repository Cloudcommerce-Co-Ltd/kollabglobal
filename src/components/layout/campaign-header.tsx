"use client";

import { useCampaignStore } from "@/stores/campaign-store";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "ตลาด", labelEn: "Country" },
  { n: 2, label: "สินค้า", labelEn: "Product" },
  { n: 3, label: "แพ็กเกจ", labelEn: "Package" },
  { n: 4, label: "ครีเอเตอร์", labelEn: "Creators" },
  { n: 5, label: "ชำระเงิน", labelEn: "Checkout" },
];

export function CampaignHeader() {
  const step = useCampaignStore((s) => s.step);

  return (
    <div className="border-b border-[#e8ecf0] bg-white px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {STEPS.map((s, i) => {
          const isDone = step > s.n;
          const isActive = step === s.n;
          return (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-sm font-bold transition-colors sm:size-8 ${
                    isDone
                      ? "bg-[#4ECDC4] text-white"
                      : isActive
                        ? "bg-[#4A90D9] text-white"
                        : "bg-[#f0f0f0] text-[#aaa]"
                  }`}
                >
                  {isDone ? <Check size={14} /> : s.n}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-[#4A90D9]" : isDone ? "text-[#4ECDC4]" : "text-[#aaa]"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-px w-6 sm:mx-2 sm:w-12 md:w-20 ${step > s.n ? "bg-[#4ECDC4]" : "bg-[#e8ecf0]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
