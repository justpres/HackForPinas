'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { HackathonWithOrganizer } from '@/lib/types';
import { CountdownBadge } from '@/components/CountdownBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { GenerativePattern } from '@/components/GenerativePattern';
import { isPhilippineHackathon, formatRegionDisplay } from '@/lib/constants';

interface EventCardProps {
  event: HackathonWithOrganizer;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasImage = !!event.poster_image_url;
  const isPh = isPhilippineHackathon(event);
  const formattedRegion = formatRegionDisplay(event.region, isPh);

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
        {/* Thumbnail area */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {hasImage ? (
            <img
              src={event.poster_image_url!}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="relative h-full w-full">
              {/* Generative geometric background */}
              <GenerativePattern
                seed={event.title}
                organizerType={event.organizer?.organizer_type}
                className="h-full w-full transition-transform duration-250 group-hover:scale-105"
              />
              {/* Overlay with event initials */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="select-none text-2xl font-bold tracking-wider text-white/70 drop-shadow-md">
                  {event.title
                    .split(/\s+/)
                    .filter((w) => w.length > 0)
                    .slice(0, 3)
                    .map((w) => w[0].toUpperCase())
                    .join('')}
                </span>
              </div>
            </div>
          )}

          {/* Scope Indicator Badge (Top Left) */}
          <div className="absolute left-2 top-2">
            {isPh ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/75 text-emerald-300 border border-emerald-500/40 backdrop-blur-md px-2 py-0.5 text-xs font-semibold shadow-xs">
                🇵🇭 PH Event
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/75 text-blue-300 border border-blue-500/40 backdrop-blur-md px-2 py-0.5 text-xs font-medium shadow-xs">
                🌐 Global Event
              </span>
            )}
          </div>

          <div className="absolute right-2 top-2">
            <CountdownBadge deadline={event.deadline} />
          </div>
        </div>

        {/* Content */}
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
            <div className={cn(
              "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
              isPh 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            )}>
              <Icon icon={isPh ? "fluent:location-16-regular" : "fluent:globe-16-regular"} width={14} />
              {formattedRegion}
            </div>
            <div className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
              <Icon icon={getFormatIcon(event.format)} width={14} />
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
