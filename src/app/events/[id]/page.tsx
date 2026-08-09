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

  const organizerName = event.organizer?.name || 'Organizer';
  const organizerType = event.organizer?.organizer_type || 'private';
  const formattedDeadline = event.deadline
    ? new Date(event.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBA';
  const formattedStart = event.event_start
    ? new Date(event.event_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  const formattedEnd = event.event_end
    ? new Date(event.event_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const formatLabel = (f: string) => {
    switch (f) {
      case 'online':
        return 'online (virtual)';
      case 'in-person':
        return 'in-person (physical)';
      case 'hybrid':
        return 'hybrid (mix of online and physical)';
      default:
        return f;
    }
  };

  const faqs = [
    {
      question: `When is the registration deadline for ${event.title}?`,
      answer: `The deadline to register for ${event.title} is ${formattedDeadline}. You should complete your registration before this date to participate.`,
    },
    {
      question: `Is ${event.title} online or in-person?`,
      answer: `This hackathon is held in a ${formatLabel(
        event.format
      )} format, targeting participants within the ${
        event.region
      } region.`,
    },
    {
      question: `Who is organizing ${event.title}?`,
      answer: `${event.title} is organized by ${organizerName}, which is verified as a ${organizerType} organizer on HackForPinas.`,
    },
    {
      question: `How do I register for ${event.title}?`,
      answer: `You can register and view the official guidelines directly on the organizer's platform by visiting: ${
        event.redirect_url || event.source_url
      }`,
    },
    ...(formattedStart
      ? [
          {
            question: `When does the ${event.title} event take place?`,
            answer: `The coding event starts on ${formattedStart}${
              formattedEnd ? ` and runs until ${formattedEnd}` : ''
            }.`,
          },
        ]
      : []),
  ];

  const graphJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        '@id': `https://hackforpinas.vercel.app/events/${event.id}#event`,
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
          name: organizerName,
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
      },
      {
        '@type': 'FAQPage',
        '@id': `https://hackforpinas.vercel.app/events/${event.id}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
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
