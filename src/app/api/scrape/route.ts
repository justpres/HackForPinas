import { NextRequest, NextResponse } from 'next/server';
import { runScrapingTask, saveScrapedEvents, SCRAPE_SOURCES } from '@/lib/scraper';

// Vercel Hobby plan: max 60s execution
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const secretKey = process.env.CRON_SECRET || 'local_development_secret';

    // Verify trigger authentication (both URL key and Vercel Cron Bearer header)
    const isAuthorized = (key === secretKey) || (authHeader === `Bearer ${secretKey}`);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let sourcesToRun;
    let nextOffset = 0;

    if (offsetParam !== null) {
      // Manual pagination mode (for local testing)
      const limit = limitParam ? parseInt(limitParam, 10) : 5;
      const offset = parseInt(offsetParam, 10);
      sourcesToRun = SCRAPE_SOURCES.slice(offset, offset + limit);
      nextOffset = offset + limit >= SCRAPE_SOURCES.length ? 0 : offset + limit;
    } else if (limitParam) {
      // Manual limit mode — pick N random sources
      const limit = parseInt(limitParam, 10);
      const shuffled = [...SCRAPE_SOURCES].sort(() => 0.5 - Math.random());
      sourcesToRun = shuffled.slice(0, limit);
    } else {
      // Cron mode (Hobby plan: twice daily) — run ALL sources
      sourcesToRun = SCRAPE_SOURCES;
    }

    const summary: { source: string; strategy: string; rawEventsFound: number; inserted: number; skipped: number }[] = [];

    // Process sources in concurrent batches of 4 to stay within timeout
    const BATCH_SIZE = 4;
    for (let i = 0; i < sourcesToRun.length; i += BATCH_SIZE) {
      const batch = sourcesToRun.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (source) => {
          console.log(`Starting crawl run for source: ${source.name}`);
          const rawEvents = await runScrapingTask(source);
          const stats = await saveScrapedEvents(source, rawEvents);
          return {
            source: source.name,
            strategy: source.strategy,
            rawEventsFound: rawEvents.length,
            inserted: stats.inserted,
            skipped: stats.skipped,
          };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          summary.push(result.value);
        } else {
          console.error('Batch source failed:', result.reason);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: sourcesToRun.length,
      totalSourcesCount: SCRAPE_SOURCES.length,
      nextOffset,
      summary,
    }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('API Scrape Runner error:', err);
    return NextResponse.json({ error: 'Internal scraper execution failure', details: message }, { status: 500 });
  }
}

