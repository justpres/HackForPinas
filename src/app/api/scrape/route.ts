import { NextRequest, NextResponse } from 'next/server';
import { runScrapingTask, saveScrapedEvents, SCRAPE_SOURCES } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const secretKey = process.env.CRON_SECRET || 'local_development_secret';

    // Verify trigger authentication
    if (key !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5; // default to run 5 sources per execution to prevent serverless timeout
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Slice sources for sequential execution to avoid hitting serverless timeouts (e.g. 10s on Vercel Hobby)
    const sourcesToRun = SCRAPE_SOURCES.slice(offset, offset + limit);
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
      nextOffset: offset + limit >= SCRAPE_SOURCES.length ? 0 : offset + limit,
      summary
    }, { status: 200 });

  } catch (err: any) {
    console.error('API Scrape Runner error:', err);
    return NextResponse.json({ error: 'Internal scraper execution failure', details: err.message }, { status: 500 });
  }
}
