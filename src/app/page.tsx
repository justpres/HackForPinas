import { createClient } from '@/lib/supabase/server';
import { HackathonWithOrganizer } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import HomepageClient from './HomepageClient';
import { MOCK_HACKATHONS } from '@/lib/mock-data';

export const revalidate = 60; // Revalidate page every 60 seconds

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

    // Fetch distinct organizers count
    const { count } = await supabase
      .from('organizers')
      .select('*', { count: 'exact', head: true });

    organizerCount = count || 0;
  } catch (err) {
    console.error('Error fetching from Supabase, falling back to mock data:', err);
  }

  // Fallback to mock data if DB is empty or query fails
  if (hackathons.length === 0) {
    hackathons = MOCK_HACKATHONS;
    const uniqueOrgIds = new Set(MOCK_HACKATHONS.map(h => h.organizer_id));
    organizerCount = uniqueOrgIds.size;
  }

  // Calculate unique regions in published hackathons
  const uniqueRegions = new Set(hackathons.map((h) => h.region));

  const stats = {
    openEvents: hackathons.filter(h => new Date(h.deadline) > new Date()).length,
    organizers: organizerCount,
    regions: uniqueRegions.size || 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <HeroSection stats={stats} />
      <main className="flex-1 py-8">
        <HomepageClient events={hackathons} />
      </main>
      <Footer />
    </div>
  );
}
