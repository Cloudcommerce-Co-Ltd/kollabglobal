"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, FileText, Video, Send, CheckCircle } from "lucide-react";
import type { CampaignCreatorWithRelation } from "@/types/campaign";

type FilterKey = "all" | "creating" | "waiting" | "ship_pending" | "done";
type StepState = "done" | "active" | "pending";

const PRIMARY = "#4ECDC4";
const SECONDARY = "#4A90D9";

function stepColor(s: StepState) {
  return s === "done" ? "#22c55e" : s === "active" ? SECONDARY : "#d1d5db";
}
function stepBg(s: StepState) {
  return s === "done" ? "#f0fdf4" : s === "active" ? "#e8f0fa" : "#f3f4f6";
}
function stepBorder(s: StepState) {
  return s === "done" ? "#22c55e" : s === "active" ? SECONDARY : "#e5e7eb";
}
function connectorColor(a: StepState, b: StepState) {
  return a === "done" && (b === "done" || b === "active") ? "#22c55e" : "#e5e7eb";
}

function getStepStates(creatorStatus: string, isLive: boolean): StepState[] {
  if (isLive) return ["done", "done", "done", "active"];
  if (creatorStatus === "COMPLETED") return ["done", "done", "done", "done"];
  if (creatorStatus === "ACCEPTED") return ["done", "active", "pending", "pending"];
  return ["active", "pending", "pending", "pending"];
}

function getCreatorLabel(creatorStatus: string, isLive: boolean): string {
  if (isLive) return "โพสต์ครบ";
  if (creatorStatus === "ACCEPTED") return "กำลังสร้าง";
  return "รอสร้าง";
}

interface CreatorPipelineProps {
  creators: CampaignCreatorWithRelation[];
  isService: boolean;
  isLive?: boolean;
  displayStatus: string;
}

export function CreatorPipeline({ creators, isService, isLive = false, displayStatus }: CreatorPipelineProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const stepIcons = isService
    ? [FileText, Video, Send, CheckCircle]
    : [Package, Video, Send, CheckCircle];

  // Show dimmed placeholder when not active/live
  if (displayStatus !== "active" && displayStatus !== "live") {
    const msg =
      displayStatus === "brief"
        ? "สร้าง Brief"
        : displayStatus === "accepting"
        ? "ครีเอเตอร์ทุกคนตอบรับ"
        : "ส่งสินค้า";
    return (
      <div
        className="bg-white rounded-2xl p-5 opacity-40"
        style={{ border: "1px solid #e8ecf0" }}
      >
        <div className="font-bold text-[#8a90a3] mb-1">Creator Pipeline</div>
        <div className="text-sm text-[#8a90a3]">จะแสดงเมื่อ{msg}แล้ว</div>
      </div>
    );
  }

  const filterOpts: { key: FilterKey; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    ...(isLive
      ? [{ key: "done" as FilterKey, label: "โพสต์ครบ" }]
      : [
          { key: "creating" as FilterKey, label: "กำลังสร้าง" },
          { key: "waiting" as FilterKey, label: "รอสร้าง" },
          ...(!isService ? [{ key: "ship_pending" as FilterKey, label: "รอรับสินค้า" }] : []),
        ]),
  ];

  function countFor(key: FilterKey) {
    if (key === "all") return creators.length;
    return creators.filter((c) => getCreatorLabel(c.status, isLive) === labelForKey(key)).length;
  }

  function labelForKey(key: FilterKey) {
    if (key === "creating") return "กำลังสร้าง";
    if (key === "waiting") return "รอสร้าง";
    if (key === "ship_pending") return "รอรับสินค้า";
    if (key === "done") return "โพสต์ครบ";
    return "";
  }

  const filtered =
    filter === "all"
      ? creators
      : creators.filter((c) => getCreatorLabel(c.status, isLive) === labelForKey(filter));

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: "1px solid #e8ecf0" }}
    >
      {/* Header + tabs */}
      <div className="px-5 pt-3.5 border-b border-[#e8ecf0]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[17px] text-[#4A4A4A]">Creator Pipeline</span>
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: `${PRIMARY}15`, color: PRIMARY }}
            >
              {creators.length} คน
            </span>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex">
          {filterOpts.map((opt) => {
            const cnt = countFor(opt.key);
            const isActive = filter === opt.key;
            const isShip = opt.key === "ship_pending";
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className="px-3.5 py-2 text-[13px] border-none bg-transparent transition-all -mb-px"
                style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? (isShip ? "#ea580c" : PRIMARY) : "#8a90a3",
                  borderBottom: isActive
                    ? `2px solid ${isShip ? "#ea580c" : PRIMARY}`
                    : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {opt.label}{" "}
                <span className="text-xs opacity-80">({cnt})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator rows */}
      {filtered.map((cc, i) => {
        const ss = getStepStates(cc.status, isLive);
        return (
          <div
            key={cc.id}
            className="grid gap-3 px-5 py-[11px] items-center"
            style={{
              gridTemplateColumns: "36px 1fr auto",
              borderBottom: i < filtered.length - 1 ? "1px solid #e8ecf0" : undefined,
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 relative overflow-hidden"
              style={{ background: "#e8f8f7", border: "2px solid #e8ecf0" }}
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

            {/* Name */}
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[#4A4A4A] truncate">{cc.creator.name}</div>
              <div className="text-xs text-[#8a90a3]">{cc.creator.niche}</div>
            </div>

            {/* Step indicators with connectors */}
            <div className="flex items-center gap-1">
              {stepIcons.map((Icon, j) => (
                <div key={j} className="flex items-center gap-1">
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: stepBg(ss[j]),
                      border: `2px solid ${stepBorder(ss[j])}`,
                    }}
                  >
                    <Icon size={10} color={stepColor(ss[j])} />
                  </div>
                  {j < 3 && (
                    <div
                      className="w-2 h-0.5 rounded"
                      style={{ background: connectorColor(ss[j], ss[j + 1]) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-[#8a90a3]">
          ไม่มีครีเอเตอร์ในหมวดนี้
        </div>
      )}
    </div>
  );
}
