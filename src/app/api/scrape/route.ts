import { NextRequest, NextResponse } from 'next/server';
import { runScrapingTask, saveScrapedEvents, SCRAPE_SOURCES } from '@/lib/scraper';

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
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const offsetParam = searchParams.get('offset');

    let sourcesToRun;
    let nextOffset = 0;

    if (offsetParam !== null) {
      const offset = parseInt(offsetParam, 10);
      sourcesToRun = SCRAPE_SOURCES.slice(offset, offset + limit);
      nextOffset = offset + limit >= SCRAPE_SOURCES.length ? 0 : offset + limit;
    } else {
      // Stateless Vercel Cron: pick 5 random sources on each trigger to distribute crawls evenly
      const shuffled = [...SCRAPE_SOURCES].sort(() => 0.5 - Math.random());
      sourcesToRun = shuffled.slice(0, limit);
    }

    const summary: any[] = [];

    for (const source of sourcesToRun) {
      console.log(`Starting crawl run for source: ${source.name}`);
      const rawEvents = await runScrapingTask(source);
      
      const stats = await saveScrapedEvents(source, rawEvents);
      summary.push({
        source: source.name,
        strategy: source.strategy,
        rawEventsFound: rawEvents.length,
        inserted: stats.inserted,
        skipped: stats.skipped
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: sourcesToRun.length,
      totalSourcesCount: SCRAPE_SOURCES.length,
      nextOffset,
      summary
    }, { status: 200 });

  } catch (err: any) {
    console.error('API Scrape Runner error:', err);
    return NextResponse.json({ error: 'Internal scraper execution failure', details: err.message }, { status: 500 });
  }
}
