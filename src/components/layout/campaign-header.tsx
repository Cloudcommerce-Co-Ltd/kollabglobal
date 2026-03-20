"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { STEP_ROUTES, getStepFromPathname } from "@/lib/campaign-steps";

export function CampaignHeader() {
  const pathname = usePathname();
  const step = getStepFromPathname(pathname) ?? 1;

  return (
    <div className="border-b border-[#e8ecf0] bg-white px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {STEP_ROUTES.map((s, i) => {
          const isDone = step > s.step;
          const isActive = step === s.step;
          return (
            <div key={s.step} className="flex items-center">
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
                  {isDone ? <Check size={14} /> : s.step}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-[#4A90D9]" : isDone ? "text-[#4ECDC4]" : "text-[#aaa]"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEP_ROUTES.length - 1 && (
                <div
                  className={`mx-1 h-px w-6 sm:mx-2 sm:w-12 md:w-20 ${step > s.step ? "bg-[#4ECDC4]" : "bg-[#e8ecf0]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
