import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface ActionCardProps {
  icon: ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  button: ReactNode;
  check?: boolean;
}

export function ActionCard({
  icon,
  iconBg,
  borderColor,
  title,
  badge,
  badgeBg,
  badgeText,
  description,
  button,
  check,
}: ActionCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-[18px] flex items-center justify-between gap-3 border ${borderColor}`}>
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-[15px] text-dark">{title}</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-[10px] text-[11px] font-semibold ${badgeBg} ${badgeText}`}>
              {check && <Check size={10} />}
              {badge}
            </span>
          </div>
          <div className="text-sm text-muted-text">{description}</div>
        </div>
      </div>
      {button}
    </div>
  );
}
