import * as cheerio from 'cheerio';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ScrapeSource {
  id: string;
  name: string;
  url: string;
  organizerType: 'government' | 'university' | 'private';
  strategy: 'wp_api' | 'rss' | 'html' | 'gdg' | 'eventbrite';
}

export const SCRAPE_SOURCES: ScrapeSource[] = [
  { id: 'dict', name: 'DICT', url: 'https://dict.gov.ph', organizerType: 'government', strategy: 'rss' },
  { id: 'dost', name: 'DOST National', url: 'https://dost.gov.ph', organizerType: 'government', strategy: 'rss' },
  { id: 'dost-calabarzon', name: 'DOST Calabarzon', url: 'https://calabarzon.dost.gov.ph', organizerType: 'government', strategy: 'wp_api' },
  { id: 'dost-ncr', name: 'DOST NCR', url: 'https://ncr.dost.gov.ph', organizerType: 'government', strategy: 'wp_api' },
  { id: 'dost-asti', name: 'DOST ASTI', url: 'https://asti.dost.gov.ph', organizerType: 'government', strategy: 'wp_api' },
  { id: 'dost-pchrd', name: 'DOST PCHRD', url: 'https://pchrd.dost.gov.ph', organizerType: 'government', strategy: 'wp_api' },
  { id: 'dost-vi', name: 'DOST VI', url: 'https://hackathon.dost6.ph', organizerType: 'government', strategy: 'html' },
  { id: 'dti', name: 'DTI', url: 'https://dti.gov.ph', organizerType: 'government', strategy: 'html' },
  { id: 'dti-ndc', name: 'DTI-NDC', url: 'https://ndc.gov.ph', organizerType: 'government', strategy: 'html' },
  { id: 'bsp', name: 'BSP', url: 'https://bsp.gov.ph', organizerType: 'government', strategy: 'html' },
  { id: 'dap', name: 'DAP', url: 'https://dap.edu.ph', organizerType: 'government', strategy: 'html' },
  { id: 'pia', name: 'PIA', url: 'https://pia.gov.ph', organizerType: 'government', strategy: 'wp_api' },
  { id: 'hackathons-ph', name: 'hackathons.ph', url: 'https://hackathons.ph', organizerType: 'private', strategy: 'html' },
  { id: 'hackathon-com', name: 'hackathon.com PH', url: 'https://www.hackathon.com/country/philippines', organizerType: 'private', strategy: 'html' },
  { id: 'eventbrite', name: 'Eventbrite PH', url: 'https://www.eventbrite.com/d/philippines--quezon-city/hackathon', organizerType: 'private', strategy: 'eventbrite' },
  { id: 'gdg', name: 'GDG Community', url: 'https://gdg.community.dev', organizerType: 'private', strategy: 'gdg' },
  { id: 'devcon', name: 'DEVCON', url: 'https://devcon.ph', organizerType: 'private', strategy: 'html' },
  { id: 'phildev', name: 'PhilDev', url: 'https://phildev.org', organizerType: 'private', strategy: 'html' },
  { id: 'fb-group', name: 'FB Group PhilHacks', url: 'https://m.facebook.com/groups/philhacks', organizerType: 'private', strategy: 'html' },
  { id: 'fb-page', name: 'FB Page Hackathon PH', url: 'https://m.facebook.com/hackathon.ph', organizerType: 'private', strategy: 'html' },
];

interface ScrapeResult {
  title: string;
  description: string;
  redirect_url: string;
  source_url: string;
  deadline?: string;
  event_start?: string;
  event_end?: string;
  region?: string;
  format?: 'online' | 'in-person' | 'hybrid';
}

export async function runScrapingTask(source: ScrapeSource): Promise<ScrapeResult[]> {
  try {
    switch (source.strategy) {
      case 'wp_api':
        return await scrapeWordPressApi(source);
      case 'rss':
        return await scrapeRssFeed(source);
      case 'gdg':
        return await scrapeGdgApi(source);
      case 'eventbrite':
        return await scrapeEventbriteHtml(source);
      case 'html':
      default:
        return await scrapeHtmlGeneric(source);
    }
  } catch (err) {
    console.error(`Scraper error for ${source.name}:`, err);
    return [];
  }
}

// 1. WordPress REST API Scraper
async function scrapeWordPressApi(source: ScrapeSource): Promise<ScrapeResult[]> {
  // Query posts matching hackathon or competition
  const queryUrl = `${source.url}/wp-json/wp/v2/posts?search=hackathon&per_page=10`;
  const res = await fetch(queryUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`WP API returned status ${res.status}`);
  
  const posts = await res.json();
  if (!Array.isArray(posts)) return [];

  return posts.map(post => {
    const rawText = post.content?.rendered || '';
    const cleanText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      title: post.title?.rendered?.replace(/&#\d+;/g, '') || 'Hackathon Post',
      description: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : ''),
      redirect_url: post.link || source.url,
      source_url: source.url,
      event_start: post.date,
      format: cleanText.toLowerCase().includes('online') ? 'online' : 'in-person'
    };
  });
}

// 2. RSS Feed Scraper (Pure JS Regex Parser)
async function scrapeRssFeed(source: ScrapeSource): Promise<ScrapeResult[]> {
  const queryUrl = `${source.url}/feed/`;
  const res = await fetch(queryUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`RSS feed returned status ${res.status}`);
  
  const xmlText = await res.text();
  const items: ScrapeResult[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const content = match[1];
    if (!content) continue;

    const title = content.match(/<title>([\s\S]*?)<\/title>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/&#\d+;/g, '')
      ?.trim();
      
    const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.trim();
      
    const description = content.match(/<description>([\s\S]*?)<\/description>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      ?.replace(/<[^>]*>/g, ' ')
      ?.trim();
      
    const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();

    // Verify if it is hackathon related
    const matchesKeyword = /hackathon|competition|coding|challenge|programming|startup/i.test(title || '') || 
                           /hackathon|competition|coding|challenge|programming|startup/i.test(description || '');

    if (title && link && matchesKeyword) {
      items.push({
        title,
        description: (description || '').slice(0, 300) + ((description || '').length > 300 ? '...' : ''),
        redirect_url: link,
        source_url: source.url,
        event_start: pubDate ? new Date(pubDate).toISOString() : undefined,
        format: (description || '').toLowerCase().includes('online') ? 'online' : 'in-person'
      });
    }
  }

  return items;
}

// 3. Bevy Event API Scraper (GDG Network)
async function scrapeGdgApi(source: ScrapeSource): Promise<ScrapeResult[]> {
  // Bevy platform public API for search
  const queryUrl = `https://gdg.community.dev/api/event/?country=Philippines&search=hackathon&page_size=10`;
  const res = await fetch(queryUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`GDG Bevy API returned status ${res.status}`);
  
  const data = await res.json();
  const events = data.results;
  if (!Array.isArray(events)) return [];

  return events.map((event: any) => ({
    title: event.title || 'GDG Hackathon',
    description: event.description_short || event.description || '',
    redirect_url: event.url || `https://gdg.community.dev/events/details/${event.id}/` || source.url,
    source_url: source.url,
    event_start: event.start_date,
    event_end: event.end_date,
    format: event.event_type === 'Virtual' ? 'online' : 'in-person',
    region: event.chapter?.city || 'NCR'
  }));
}

// 4. Eventbrite HTML JSON-LD Script Scraper
async function scrapeEventbriteHtml(source: ScrapeSource): Promise<ScrapeResult[]> {
  const res = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Eventbrite page returned status ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapeResult[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const scriptText = $(el).html();
      if (!scriptText) return;
      
      const json = JSON.parse(scriptText);
      
      // Eventbrite packs lists under itemList or single event
      if (json['@type'] === 'Event') {
        items.push(parseEventbriteEvent(json, source.url));
      } else if (Array.isArray(json)) {
        json.forEach(item => {
          if (item['@type'] === 'Event') {
            items.push(parseEventbriteEvent(item, source.url));
          }
        });
      } else if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
        json.itemListElement.forEach((element: any) => {
          if (element.item && element.item['@type'] === 'Event') {
            items.push(parseEventbriteEvent(element.item, source.url));
          }
        });
      }
    } catch {
      // Ignore JSON parse errors in individual tags
    }
  });

  return items;
}

function parseEventbriteEvent(eventJson: any, sourceUrl: string): ScrapeResult {
  return {
    title: eventJson.name || 'Eventbrite Hackathon',
    description: eventJson.description || '',
    redirect_url: eventJson.url || sourceUrl,
    source_url: sourceUrl,
    event_start: eventJson.startDate,
    event_end: eventJson.endDate,
    format: eventJson.eventAttendanceMode?.includes('Online') ? 'online' : 'in-person'
  };
}

// 5. Traditional HTML Parser using Cheerio & Keywords
async function scrapeHtmlGeneric(source: ScrapeSource): Promise<ScrapeResult[]> {
  const res = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Portal page returned status ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapeResult[] = [];

  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    let absoluteUrl = href;
    try {
      absoluteUrl = href.startsWith('http') ? href : new URL(href, source.url).toString();
    } catch {
      return; // Skip invalid links
    }

    const linkText = $(el).text().trim();
    const surroundingBlock = $(el).closest('div, section, article, p, li');
    const surroundingText = surroundingBlock.text().trim();

    // Look for search triggers in link text or URLs
    const isHackathonRelated = /hackathon|competition|coding|programming|challenge/i.test(linkText) || 
                               /hackathon|competition|coding|programming|challenge/i.test(absoluteUrl) ||
                               (/register|apply|join/i.test(linkText) && /hackathon|competition|coding/i.test(surroundingText));

    if (isHackathonRelated && absoluteUrl !== source.url) {
      let title = linkText;
      if (title.length < 5 || title.length > 100) {
        // Look for heading text inside the container block
        const headingText = surroundingBlock.find('h1, h2, h3, h4, h5').first().text().trim();
        if (headingText && headingText.length > 5 && headingText.length < 100) {
          title = headingText;
        }
      }

      title = title.replace(/\s+/g, ' ').trim();
      const cleanDesc = surroundingText.replace(/\s+/g, ' ').trim();

      // Extract basic date context if available (standard Philippine formats)
      const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(, \d{4})?/gi;
      const dates = cleanDesc.match(dateRegex);

      if (title && title.length > 3) {
        items.push({
          title,
          description: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
          redirect_url: absoluteUrl,
          source_url: source.url,
          event_start: dates?.[0] ? new Date(dates[0]).toISOString() : undefined,
          format: cleanDesc.toLowerCase().includes('online') ? 'online' : 'in-person'
        });
      }
    }
  });

  // Deduplicate results by redirect URL
  const uniqueItems = Array.from(new Map(items.map(item => [item.redirect_url, item])).values());
  return uniqueItems.slice(0, 8); // Cap to avoid flooding reviews
}

// 6. Save Staged Events to Supabase
export async function saveScrapedEvents(source: ScrapeSource, events: ScrapeResult[]) {
  if (events.length === 0) return { inserted: 0, skipped: 0 };
  
  const supabase = await createAdminClient();
  let inserted = 0;
  let skipped = 0;

  // Get or create Organizer ID matching the scraper source
  const { data: existingOrg } = await supabase
    .from('organizers')
    .select('id')
    .eq('name', source.name)
    .single();

  let organizerId;
  if (existingOrg) {
    organizerId = existingOrg.id;
  } else {
    const { data: newOrg } = await supabase
      .from('organizers')
      .insert({
        name: source.name,
        organizer_type: source.organizerType
      })
      .select('id')
      .single();
    organizerId = newOrg?.id;
  }

  if (!organizerId) return { inserted: 0, skipped: 0 };

  for (const event of events) {
    try {
      // Check if event already exists in DB (deduplicate via redirect_url)
      const { data: existingHackathon } = await supabase
        .from('hackathons')
        .select('id')
        .eq('redirect_url', event.redirect_url)
        .maybeSingle();

      if (existingHackathon) {
        skipped++;
        continue;
      }

      // Format start and end date checks
      let eventStart = event.event_start;
      if (eventStart) {
        const parsed = Date.parse(eventStart);
        if (isNaN(parsed)) eventStart = undefined;
      }

      let eventEnd = event.event_end;
      if (eventEnd) {
        const parsed = Date.parse(eventEnd);
        if (isNaN(parsed)) eventEnd = undefined;
      }

      // Default values mapping
      const { data: newHack, error } = await supabase
        .from('hackathons')
        .insert({
          title: event.title.slice(0, 100),
          description: event.description || 'Staged event from directory monitoring.',
          organizer_id: organizerId,
          redirect_url: event.redirect_url,
          source_url: event.source_url,
          region: event.region || 'all',
          format: event.format || 'online',
          event_start: eventStart,
          event_end: eventEnd,
          deadline: eventStart, // fallback deadline to start if missing
          source_type: 'official_site',
          status: 'pending_review'
        })
        .select('id')
        .single();

      if (error) {
        console.error(`DB insert error for ${event.title}:`, error);
        skipped++;
        continue;
      }

      if (newHack) {
        // Add audit log
        await supabase.from('submissions_audit_log').insert({
          hackathon_id: newHack.id,
          action: 'submitted',
          actor: 'community',
          notes: `Staged via dynamic directory scraper run for source: ${source.name}`
        });
        inserted++;
      }
    } catch (err) {
      console.error(`Error saving event: ${event.title}`, err);
      skipped++;
    }
  }

  return { inserted, skipped };
}
