import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CountdownBadge } from '@/components/CountdownBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { HackathonWithOrganizer } from '@/lib/types';
import { format } from 'date-fns';
import { MOCK_HACKATHONS } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  let event: { title: string; description: string } | null = null;

  try {
    const { data } = await supabase
      .from('hackathons')
      .select('title, description')
      .eq('id', id)
      .single();
    event = data as { title: string; description: string } | null;
  } catch (err) {
    // Ignore database query failure
  }

  if (!event) {
    const mock = MOCK_HACKATHONS.find(h => h.id === id);
    if (mock) {
      event = { title: mock.title, description: mock.description };
    }
  }

  if (!event) {
    return {
      title: 'Event Not Found | HackForPinas',
    };
  }

  return {
    title: `${event.title} | HackForPinas`,
    description: event.description,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  let event: HackathonWithOrganizer | null = null;

  try {
    const { data } = await supabase
      .from('hackathons')
      .select('*, organizer:organizers(*)')
      .eq('id', id)
      .eq('status', 'published')
      .single();
    event = data as HackathonWithOrganizer | null;
  } catch (err) {
    // Ignore database query failure
  }

  if (!event) {
    const mock = MOCK_HACKATHONS.find(h => h.id === id);
    if (mock) {
      event = mock;
    }
  }

  if (!event) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.event_start || event.deadline,
    endDate: event.event_end || event.deadline,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      event.format === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.format === 'in-person'
        ? 'https://schema.org/OfflineEventAttendanceMode'
        : 'https://schema.org/MixedEventAttendanceMode',
    location:
      event.format === 'online'
        ? {
            '@type': 'VirtualLocation',
            url: event.redirect_url,
          }
        : {
            '@type': 'Place',
            name: event.region,
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'PH',
              addressRegion: event.region,
            },
          },
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name || 'Organizer',
      url: event.organizer?.official_website || undefined,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PHP',
      availability: 'https://schema.org/InStock',
      url: event.redirect_url,
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-foreground">Events</Link>
            <Icon icon="fluent:chevron-right-16-regular" />
            <span className="truncate">{event.title}</span>
          </nav>

          <div className="aspect-video bg-muted rounded-lg mb-8 flex items-center justify-center overflow-hidden">
            {event.poster_image_url ? (
              <img src={event.poster_image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <Icon icon="fluent:image-24-regular" className="w-16 h-16 text-blue-300" />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                <span>{event.organizer?.name}</span>
                {event.organizer?.is_verified && <VerifiedBadge />}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {event.deadline && <CountdownBadge deadline={event.deadline} />}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-card rounded-lg p-6 border shadow-sm">
            <div>
              <div className="text-sm text-muted-foreground">Region</div>
              <div className="font-medium capitalize">{event.region}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Format</div>
              <div className="font-medium capitalize">{event.format}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Organizer Type</div>
              <div className="font-medium capitalize">{event.organizer?.organizer_type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Deadline</div>
              <div className="font-medium">
                {event.deadline ? format(new Date(event.deadline), 'MMM d, yyyy') : 'No deadline'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Event Start</div>
              <div className="font-medium">
                {event.event_start ? format(new Date(event.event_start), 'MMM d, yyyy') : 'TBA'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Event End</div>
              <div className="font-medium">
                {event.event_end ? format(new Date(event.event_end), 'MMM d, yyyy') : 'TBA'}
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">About this Event</h2>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {event.description}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1 mb-1">
                <Icon icon="fluent:info-16-regular" />
                <span>Source: <span className="capitalize font-medium">{event.source_type}</span></span>
              </div>
              <div>
                Last verified: {event.last_checked_at ? format(new Date(event.last_checked_at), 'MMM d, yyyy') : 'TBA'}
              </div>
            </div>
            
            <a 
              href={event.redirect_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                Register / View Source
                <Icon icon="fluent:open-16-regular" />
              </Button>
            </a>
          </div>

          {/* Generative Engine Optimization (GEO) Structured Summary Section */}
          <section className="mt-12 border-t border-border/10 pt-8" aria-label="Quick Summary Facts">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Facts & Event Citations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground bg-muted/20 rounded-lg p-6 border border-border/10">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Technical Overview</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Event Name:</strong> {event.title}</li>
                  <li><strong>Regional Scope:</strong> {event.region} (Philippine Regional Directory classification)</li>
                  <li><strong>Attendance Format:</strong> {event.format === 'in-person' ? 'Physical/Offline Venue' : event.format === 'online' ? 'Virtual/Online Platform' : 'Hybrid/Mixed Attendance'}</li>
                  <li><strong>Registration Status:</strong> Free, Public Registration (Discover Directory Listing)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Authority & Citations</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Organizing Entity:</strong> {event.organizer?.name} ({event.organizer?.organizer_type} organizer)</li>
                  <li><strong>Source Verification:</strong> Monitored via {event.source_type === 'facebook' ? 'Official Facebook Page Feed' : event.source_type === 'official_site' ? 'Primary Organization Portal' : 'Community Submission Audit Queue'}</li>
                  <li><strong>Official Portal:</strong> <a href={event.source_url || event.redirect_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{event.source_url || event.redirect_url}</a></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
