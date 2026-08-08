import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function VerifiedBadge({ variant = 'compact', className }: VerifiedBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium',
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        className
      )}
    >
      <Icon icon="fluent:shield-checkmark-16-filled" width={16} />
      {variant === 'full' ? 'Government Verified' : 'Verified'}
    </div>
  );
}
