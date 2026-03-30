import type { DisplayStatus } from '@/lib/campaign-detail-utils';

export interface DurationDisplay {
  text: string;
  label?: string;
  isOverdue: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeDurationDisplay(params: {
  displayStatus: DisplayStatus;
  duration: number;
  deadline: string | null;
  liveAt: string | null;
  now?: Date;
}): DurationDisplay {
  const {
    displayStatus,
    duration,
    deadline,
    liveAt,
    now = new Date(),
  } = params;

  if (
    displayStatus === 'awaiting_payment' ||
    displayStatus === 'brief' ||
    displayStatus === 'cancelled'
  ) {
    return { text: `${duration} วัน`, isOverdue: false };
  }

  if (displayStatus === 'live') {
    return { text: `${duration} วัน`, isOverdue: false };
  }

  // accepting, ship, active — show countdown to deadline
  if (!deadline) {
    return { text: `${duration} วัน`, isOverdue: false };
  }

  // Parse deadline as end-of-day to avoid off-by-one from timezone
  const deadlineDate = new Date(`${deadline}T23:59:59`);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / MS_PER_DAY);

  if (diffDays > 10) {
    return { text: `เหลือ ${diffDays} วัน`, isOverdue: false };
  }

  if (diffDays >= 0) {
    return { text: `อีก ${diffDays} วัน`, isOverdue: false };
  }

  const overdueDays = Math.abs(diffDays);
  return { text: `เกิน ${overdueDays} วัน`, label: '', isOverdue: true };
}
