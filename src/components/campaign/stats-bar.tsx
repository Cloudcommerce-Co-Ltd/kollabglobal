import { Users, TrendingUp, Globe, Calendar } from 'lucide-react';
import type { DurationDisplay } from '@/lib/campaign-duration';

interface StatsBarProps {
  activeCount: number;
  totalCount: number;
  platformCount: number;
  isLive: boolean;
  durationDisplay: DurationDisplay;
}

const stats = [
  {
    key: 'creators',
    label: 'ครีเอเตอร์ที่แอคทีฟ',
    unit: 'คน',
    cardCls: 'bg-secondary-brand/[3%] border-secondary-brand/[12%]',
    iconCls: 'bg-secondary-brand',
    Icon: Users,
  },
  {
    key: 'status',
    label: 'สถานะโดยรวม',
    unit: '',
    cardCls: 'bg-brand/[3%] border-brand/[12%]',
    iconCls: 'bg-brand',
    Icon: TrendingUp,
  },
  {
    key: 'platforms',
    label: 'แพลตฟอร์ม',
    unit: 'แพลตฟอร์ม',
    cardCls: 'bg-accent-brand/[3%] border-accent-brand/[12%]',
    iconCls: 'bg-accent-brand',
    Icon: Globe,
  },
  {
    key: 'duration',
    label: 'ระยะเวลาแคมเปญ',
    unit: '',
    cardCls: 'bg-green-600/[3%] border-green-600/[12%]',
    iconCls: 'bg-green-600',
    Icon: Calendar,
  },
] as const;

export function StatsBar({ activeCount, totalCount, platformCount, isLive, durationDisplay }: StatsBarProps) {
  const values: Record<string, string> = {
    creators: `${activeCount}/${totalCount}`,
    status: isLive ? 'กำลัง Live' : 'กำลังดำเนินการ',
    platforms: platformCount.toString(),
    duration: durationDisplay.text,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map(({ key, label, unit, cardCls, iconCls, Icon }) => {
        const isDuration = key === 'duration';
        const overdue = isDuration && durationDisplay.isOverdue;
        const displayLabel = isDuration && durationDisplay.label ? `${label} ${durationDisplay.label}` : label;
        const finalCardCls = overdue ? 'bg-red-600/[3%] border-red-600/[12%]' : cardCls;
        const finalIconCls = overdue ? 'bg-red-600' : iconCls;

        return (
          <div key={key} className={`rounded-xl p-3 flex items-center gap-2.5 border ${finalCardCls}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${finalIconCls}`}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-muted-text mb-0.5">{displayLabel}</div>
              <div className={`text-lg font-bold leading-none ${overdue ? 'text-red-600' : 'text-dark'}`}>
                {values[key]}{' '}
                {unit && <span className="text-xs font-normal text-muted-text">{unit}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
