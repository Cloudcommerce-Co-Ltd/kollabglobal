import { Users, TrendingUp, Globe, Calendar } from "lucide-react";

interface StatsBarProps {
  activeCount: number;
  totalCount: number;
  platformCount: number;
  isLive: boolean;
}

const PRIMARY = "#4ECDC4";
const SECONDARY = "#4A90D9";
const ACCENT = "#9B7ED8";
const GREEN = "#16a34a";

export function StatsBar({ activeCount, totalCount, platformCount, isLive }: StatsBarProps) {
  const stats = [
    { label: "ครีเอเตอร์ที่แอคทีฟ", value: `${activeCount}/${totalCount}`, unit: "คน", color: SECONDARY, Icon: Users },
    { label: "สถานะโดยรวม", value: isLive ? "กำลัง Live" : "กำลังดำเนินการ", unit: "", color: PRIMARY, Icon: TrendingUp },
    { label: "แพลตฟอร์ม", value: platformCount.toString(), unit: "แพลตฟอร์ม", color: ACCENT, Icon: Globe },
    { label: "ระยะเวลาแคมเปญ", value: "30", unit: "วัน", color: GREEN, Icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-3 flex items-center gap-2.5"
          style={{
            background: `${s.color}08`,
            border: `1px solid ${s.color}20`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: s.color }}
          >
            <s.Icon size={16} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[#8a90a3] mb-0.5">{s.label}</div>
            <div className="text-lg font-bold text-[#4A4A4A] leading-none">
              {s.value}{" "}
              {s.unit && (
                <span className="text-xs font-normal text-[#8a90a3]">{s.unit}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
