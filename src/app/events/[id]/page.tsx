import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HackathonWithOrganizer } from '@/lib/types';
import { EventDetailClient } from './EventDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  type EventMeta = { title: string; description: string; poster_image_url: string | null };
  let event: EventMeta | null = null;

  try {
    const { data } = await supabase
      .from('hackathons')
      .select('title, description, poster_image_url')
      .eq('id', id)
      .single();
    event = data as EventMeta | null;
  } catch {
    // Ignore database query failure
  }

  if (!event) {
    return {
      title: 'Event Not Found | HackForPinas',
    };
  }

  const e = event as EventMeta;

  return {
    title: `${e.title} | HackForPinas`,
    description: e.description,
    openGraph: {
      title: e.title,
      description: e.description,
      type: 'article',
      locale: 'en_PH',
      siteName: 'HackForPinas',
      ...(e.poster_image_url ? { images: [{ url: e.poster_image_url, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: e.title,
      description: e.description,
      ...(e.poster_image_url ? { images: [e.poster_image_url] } : {}),
    },
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
  } catch {
    // Ignore database query failure
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
    ...(event.poster_image_url ? { image: event.poster_image_url } : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PHP',
      availability: 'https://schema.org/InStock',
      url: event.redirect_url,
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <article>
          <EventDetailClient event={event} />
        </article>
      </main>
      <Footer />
    </div>
  );
}
