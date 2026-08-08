'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { HackathonWithOrganizer } from '@/lib/types';
import { CountdownBadge } from '@/components/CountdownBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface EventCardProps {
  event: HackathonWithOrganizer;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'online':
        return 'fluent:desktop-16-regular';
      case 'in-person':
        return 'fluent:people-16-regular';
      case 'hybrid':
        return 'fluent:wifi-1-16-regular';
      default:
        return 'fluent:building-16-regular';
    }
  };

  const getPlaceholderColor = (organizerType?: string) => {
    switch (organizerType?.toLowerCase()) {
      case 'government':
        return 'bg-blue-600/10 text-blue-600';
      case 'university':
        return 'bg-purple-600/10 text-purple-600';
      default:
        return 'bg-slate-600/10 text-slate-600';
    }
  };

  return (
    <Link href={`/events/${event.id}`}>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        whileHover={shouldReduceMotion ? {} : { y: -2 }}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-muted/50',
          className
        )}
        style={{
          boxShadow: 'var(--shadow-resting)',
        }}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {event.poster_image_url ? (
            <img
              src={event.poster_image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center text-3xl font-bold uppercase',
                getPlaceholderColor(event.organizer?.organizer_type)
              )}
            >
              {event.title.substring(0, 2)}
            </div>
          )}
          <div className="absolute right-2 top-2">
            <CountdownBadge deadline={event.deadline} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight">
              {event.title}
            </h3>
            {event.organizer && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="truncate">{event.organizer.name}</span>
                {event.organizer.is_verified && <VerifiedBadge />}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Icon icon="fluent:location-16-regular" width={16} />
              {event.region}
            </div>
            <div className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Icon icon={getFormatIcon(event.format)} width={16} />
              {event.format}
            </div>
          </div>

          {event.last_checked_at && (
            <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
              <Icon icon="fluent:clock-16-regular" width={14} />
              Last verified: {new Date(event.last_checked_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
