'use client';
import { Icon } from '@iconify/react';
import { getDeadlineUrgency, getDeadlineLabel } from '@/lib/deadline';
import { cn } from '@/lib/utils';

export function CountdownBadge({ deadline, className }: { deadline: string; className?: string }) {
  const urgency = getDeadlineUrgency(deadline);
  const label = getDeadlineLabel(deadline);

  const colorMap = {
    neutral: 'bg-deadline-neutral text-deadline-neutral-fg',
    amber: 'bg-deadline-amber text-deadline-amber-fg',
    urgent: 'bg-deadline-urgent text-deadline-urgent-fg',
    expired: 'bg-deadline-expired text-deadline-expired-fg'
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium", colorMap[urgency], className)}>
      <Icon icon="fluent:calendar-16-regular" width={14} height={14} />
      {label}
    </span>
  );
}
