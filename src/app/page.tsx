import { createClient } from '@/lib/supabase/server';
import { HackathonWithOrganizer } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import HomepageClient from './HomepageClient';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  let hackathons: HackathonWithOrganizer[] = [];
  let organizerCount = 0;

  try {
    // Fetch published hackathons with organizer details
    const { data: hackathonsData } = await supabase
      .from('hackathons')
      .select('*, organizer:organizers(*)')
      .eq('status', 'published')
      .order('deadline', { ascending: true });

    hackathons = (hackathonsData || []) as HackathonWithOrganizer[];
    console.log("Supabase URL used in HomePage:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Fetched published hackathons count:", hackathons.length);

    // Fetch distinct organizers count
    const { count } = await supabase
      .from('organizers')
      .select('*', { count: 'exact', head: true });

    organizerCount = count || 0;
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
  }

  // Calculate unique regions in published hackathons
  const uniqueRegions = new Set(hackathons.map((h) => h.region));

  const stats = {
    openEvents: hackathons.filter(h => new Date(h.deadline) > new Date()).length,
    organizers: organizerCount,
    regions: uniqueRegions.size || 0,
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackforpinas.gg';
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'numberOfItems': hackathons.length,
    'itemListElement': hackathons.map((event, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Event',
        'name': event.title,
        'url': `${baseUrl}/events/${event.id}`,
        'startDate': event.event_start || event.deadline,
        'endDate': event.event_end || event.deadline,
        'eventAttendanceMode':
          event.format === 'online'
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : event.format === 'in-person'
            ? 'https://schema.org/OfflineEventAttendanceMode'
            : 'https://schema.org/MixedEventAttendanceMode',
        'location':
          event.format === 'online'
            ? {
                '@type': 'VirtualLocation',
                'url': `${baseUrl}/events/${event.id}`,
              }
            : {
                '@type': 'Place',
                'name': event.region === 'International' ? 'Global' : event.region,
                'address': event.region === 'International'
                  ? {
                      '@type': 'PostalAddress',
                      'name': 'International',
                    }
                  : {
                      '@type': 'PostalAddress',
                      'addressCountry': 'PH',
                      'addressRegion': event.region,
                    },
              },
        'organizer': {
          '@type': 'Organization',
          'name': event.organizer?.name || 'Organizer',
        },
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />
      <HeroSection stats={stats} />
      <main className="flex-1 py-8">
        <HomepageClient events={hackathons} />
      </main>
      <Footer />
    </div>
  );
}

