'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HackathonWithOrganizer } from '@/lib/types';
import { CountdownBadge } from '@/components/CountdownBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { GenerativePattern } from '@/components/GenerativePattern';
import { StickyActionBar } from '@/components/StickyActionBar';
import { AeoAnswerBox } from '@/components/AeoAnswerBox';

interface EventDetailClientProps {
  event: HackathonWithOrganizer;
}

// Metadata island component
function MetadataIsland({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center',
        'transition-all duration-200 hover:-translate-y-0.5'
      )}
      style={{ boxShadow: 'var(--shadow-resting)' }}
    >
      <Icon
        icon={icon}
        width={20}
        className="text-muted-foreground"
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold capitalize">{value}</span>
    </div>
  );
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  const hasImage = !!event.poster_image_url;

  const formatLabel = (f: string) => {
    switch (f) {
      case 'online': return 'Virtual / Online';
      case 'in-person': return 'Physical / On-site';
      case 'hybrid': return 'Hybrid / Mixed';
      default: return f;
    }
  };

  const formatIcon = (f: string) => {
    switch (f) {
      case 'online': return 'fluent:desktop-16-regular';
      case 'in-person': return 'fluent:people-16-regular';
      case 'hybrid': return 'fluent:wifi-1-16-regular';
      default: return 'fluent:building-16-regular';
    }
  };

  return (
    <>
      {/* Sticky Action Bar */}
      <StickyActionBar
        title={event.title}
        deadline={event.deadline}
        redirectUrl={event.redirect_url}
        heroRef={heroRef}
      />

      {/* ── Section 1: Full-Bleed Hero Banner ─────────────────────── */}
      <div ref={heroRef} className="relative w-full overflow-hidden">
        {/* Hero image or generative pattern */}
        <div className="relative aspect-[21/9] min-h-[280px] max-h-[420px] w-full md:aspect-[3/1]">
          {hasImage ? (
            <img
              src={event.poster_image_url!}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <GenerativePattern
              seed={event.title}
              organizerType={event.organizer?.organizer_type}
              className="h-full w-full"
            />
          )}

          {/* Gradient scrim for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--background) 0%, var(--background) 5%, transparent 60%)',
            }}
          />
          {/* Secondary scrim for top breadcrumb */}
          <div
            className="absolute inset-x-0 top-0 h-20"
            style={{
              background: 'linear-gradient(to bottom, oklch(0 0 0 / 0.4), transparent)',
            }}
          />
        </div>

        {/* Overlay content positioned at bottom of hero */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-6 md:pb-8">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav
              className="mb-4 flex items-center gap-2 text-sm text-white/70"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px] inline-flex items-center"
              >
                Events
              </Link>
              <Icon icon="fluent:chevron-right-16-regular" width={14} />
              <span className="truncate text-white/50">{event.title}</span>
            </nav>

            {/* Title + Organizer + Countdown */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1
                  className="text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl"
                  style={{ textShadow: '0 2px 8px oklch(0 0 0 / 0.5)' }}
                >
                  {event.title}
                </h1>
                {event.organizer && (
                  <div className="mt-2 flex items-center gap-2 text-base text-white/80">
                    <span>{event.organizer.name}</span>
                    {event.organizer.is_verified && <VerifiedBadge />}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <CountdownBadge deadline={event.deadline} className="text-sm px-3 py-1.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="container mx-auto max-w-4xl px-4">

        {/* ── Section 2: Primary CTA ──────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Icon icon="fluent:info-16-regular" width={16} />
            <span>
              Source:{' '}
              <span className="font-medium capitalize text-foreground">
                {event.source_type === 'facebook'
                  ? 'Facebook Page'
                  : event.source_type === 'official_site'
                  ? 'Official Website'
                  : 'Community Submission'}
              </span>
            </span>
          </div>
          <a
            href={event.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-5 py-2.5',
              'bg-primary text-primary-foreground text-sm font-medium',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              'min-h-[44px]'
            )}
          >
            Register / View Source
            <Icon icon="fluent:open-16-regular" width={16} />
          </a>
        </div>

        {/* ── Section 3: Metadata Islands ─────────────────────────── */}
        <section aria-label="Event details" className="pb-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetadataIsland
              icon="fluent:calendar-clock-16-regular"
              label="Deadline"
              value={event.deadline ? format(new Date(event.deadline), 'MMM d, yyyy') : 'TBA'}
            />
            <MetadataIsland
              icon="fluent:location-16-regular"
              label="Region"
              value={event.region}
            />
            <MetadataIsland
              icon={formatIcon(event.format)}
              label="Format"
              value={formatLabel(event.format)}
            />
            <MetadataIsland
              icon="fluent:building-people-16-regular"
              label="Organizer Type"
              value={event.organizer?.organizer_type || 'Private'}
            />
            <MetadataIsland
              icon="fluent:calendar-arrow-right-16-regular"
              label="Starts"
              value={event.event_start ? format(new Date(event.event_start), 'MMM d, yyyy') : 'TBA'}
            />
            <MetadataIsland
              icon="fluent:calendar-checkmark-16-regular"
              label="Ends"
              value={event.event_end ? format(new Date(event.event_end), 'MMM d, yyyy') : 'TBA'}
            />
          </div>
        </section>

        {/* ── Section 4: About This Event ─────────────────────────── */}
        <section aria-label="About this event" className="pb-10">
          <h2 className="mb-4 text-xl font-semibold">About this Event</h2>
          <div className="border-l-2 border-primary/30 pl-5">
            <div className="max-w-prose whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {event.description}
            </div>
          </div>
        </section>

        {/* ── Section 5: Trust & Verification Footer ──────────────── */}
        <section
          aria-label="Source verification"
          className="mb-10 rounded-lg border bg-muted/30 p-6"
        >
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon icon="fluent:shield-checkmark-16-regular" width={16} className="text-emerald-500" />
              <span>
                Verified via{' '}
                <span className="font-medium capitalize text-foreground">
                  {event.source_type === 'facebook'
                    ? 'Official Facebook Page Feed'
                    : event.source_type === 'official_site'
                    ? 'Primary Organization Portal'
                    : 'Community Submission Audit'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="fluent:clock-16-regular" width={16} />
              <span>
                Last checked:{' '}
                {event.last_checked_at
                  ? format(new Date(event.last_checked_at), 'MMM d, yyyy')
                  : 'Pending'}
              </span>
            </div>
            {(event.source_url || event.redirect_url) && (
              <div className="flex items-center gap-2">
                <Icon icon="fluent:link-16-regular" width={16} />
                <a
                  href={event.source_url || event.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {event.source_url || event.redirect_url}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 5.5: AEO Answer Engine Summary ──────────────── */}
        <div className="mb-10">
          <AeoAnswerBox event={event} />
        </div>

        {/* ── Section 6: GEO Structured Summary ───────────────────── */}
        <section className="mb-12 border-t border-border/10 pt-8" aria-label="Quick Summary Facts">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Facts & Event Citations</h3>
          <div className="grid grid-cols-1 gap-6 rounded-lg border border-border/10 bg-muted/20 p-6 text-sm text-muted-foreground md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-foreground">Technical Overview</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Event Name:</strong> {event.title}
                </li>
                <li>
                  <strong>Regional Scope:</strong> {event.region} (Philippine Regional Directory
                  classification)
                </li>
                <li>
                  <strong>Attendance Format:</strong>{' '}
                  {event.format === 'in-person'
                    ? 'Physical/Offline Venue'
                    : event.format === 'online'
                    ? 'Virtual/Online Platform'
                    : 'Hybrid/Mixed Attendance'}
                </li>
                <li>
                  <strong>Registration Status:</strong> Free, Public Registration (Discover
                  Directory Listing)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-foreground">Authority & Citations</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Organizing Entity:</strong> {event.organizer?.name} (
                  {event.organizer?.organizer_type} organizer)
                </li>
                <li>
                  <strong>Source Verification:</strong> Monitored via{' '}
                  {event.source_type === 'facebook'
                    ? 'Official Facebook Page Feed'
                    : event.source_type === 'official_site'
                    ? 'Primary Organization Portal'
                    : 'Community Submission Audit Queue'}
                </li>
                <li>
                  <strong>Official Portal:</strong>{' '}
                  <a
                    href={event.source_url || event.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-primary hover:underline"
                  >
                    {event.source_url || event.redirect_url}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
