import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackforpinas.gg';

  // Base directory paths
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic events details routes
  let eventUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: events } = await supabase
      .from('hackathons')
      .select('id, last_checked_at')
      .eq('status', 'published');

    if (events && events.length > 0) {
      eventUrls = events.map(event => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.last_checked_at || new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (err) {
    // Ignore database failures
  }

  return [...routes, ...eventUrls];
}
