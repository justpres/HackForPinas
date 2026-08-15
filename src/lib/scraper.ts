import * as cheerio from 'cheerio';
import { createAdminClient } from '@/lib/supabase/admin';
import { isLiveUrl } from './redirect-validator';

export interface ScrapeSource {
  id: string;
  name: string;
  url: string;
  organizerType: 'government' | 'university' | 'private';
  strategy: 'wp_api' | 'rss' | 'html' | 'gdg' | 'eventbrite' | 'devpost' | 'devfolio';
  defaultRegion?: string;
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
  // Foreign & Global Hackathon Sources
  { id: 'devpost-global', name: 'Devpost Global', url: 'https://devpost.com/hackathons.rss', organizerType: 'private', strategy: 'devpost', defaultRegion: 'International' },
  { id: 'devfolio-global', name: 'Devfolio Global', url: 'https://api.devfolio.co/api/hackathons', organizerType: 'private', strategy: 'devfolio', defaultRegion: 'International' },
  { id: 'eventbrite-global-online', name: 'Eventbrite Global Online', url: 'https://www.eventbrite.com/d/online/hackathon/', organizerType: 'private', strategy: 'eventbrite', defaultRegion: 'International' },
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
  poster_image_url?: string;
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
      case 'devpost':
        return await scrapeDevpostRss(source);
      case 'devfolio':
        return await scrapeDevfolioApi(source);
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
    
    // Extract first image in post content
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const imgMatch = rawText.match(imgRegex);
    const featuredImage = imgMatch ? imgMatch[1] : undefined;
    
    return {
      title: post.title?.rendered?.replace(/&#\d+;/g, '') || 'Hackathon Post',
      description: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : ''),
      redirect_url: post.link || source.url,
      source_url: source.url,
      event_start: post.date,
      format: cleanText.toLowerCase().includes('online') ? 'online' : 'in-person',
      poster_image_url: featuredImage
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
    region: event.chapter?.city || 'NCR',
    poster_image_url: event.cropped_picture_url || event.picture?.url || event.logo?.url || undefined
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
  let imageUrl: string | undefined;
  if (typeof eventJson.image === 'string') {
    imageUrl = eventJson.image;
  } else if (Array.isArray(eventJson.image) && typeof eventJson.image[0] === 'string') {
    imageUrl = eventJson.image[0];
  } else if (eventJson.image && typeof eventJson.image === 'object') {
    imageUrl = eventJson.image.url || eventJson.image.contentUrl;
  }

  return {
    title: eventJson.name || 'Eventbrite Hackathon',
    description: eventJson.description || '',
    redirect_url: eventJson.url || sourceUrl,
    source_url: sourceUrl,
    event_start: eventJson.startDate,
    event_end: eventJson.endDate,
    format: eventJson.eventAttendanceMode?.includes('Online') ? 'online' : 'in-person',
    poster_image_url: imageUrl
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

      // Look for any image inside the surrounding block to use as cover thumbnail
      let imgUrl = surroundingBlock.find('img').first().attr('src');
      if (imgUrl && !imgUrl.startsWith('http')) {
        try {
          imgUrl = new URL(imgUrl, source.url).toString();
        } catch {
          imgUrl = undefined;
        }
      }

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
          format: cleanDesc.toLowerCase().includes('online') ? 'online' : 'in-person',
          poster_image_url: imgUrl
        });
      }
    }
  });

  // Deduplicate results by redirect URL
  const uniqueItems = Array.from(new Map(items.map(item => [item.redirect_url, item])).values());
  return uniqueItems.slice(0, 8); // Cap to avoid flooding reviews
}

// 6. Devpost Global RSS Scraper
async function scrapeDevpostRss(source: ScrapeSource): Promise<ScrapeResult[]> {
  const queryUrl = source.url;
  const res = await fetch(queryUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Devpost RSS returned status ${res.status}`);

  const xmlText = await res.text();
  const items: ScrapeResult[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  // Keyword check to filter out localized Philippine events from foreign crawl
  const phFilterRegex = /\b(philippines|filipino|taguig|makati|manila|cebu|davao|quezon city|dost|dict)\b/i;

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

    const rawDesc = content.match(/<description>([\s\S]*?)<\/description>/)?.[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1') || '';

    // Extract image from description or enclosure
    const enclosureImg = content.match(/<enclosure[^>]+url="([^">]+)"/)?.[1];
    const descImgMatch = rawDesc.match(/<img[^>]+src="([^">]+)"/)?.[1];
    const poster = enclosureImg || descImgMatch;

    const cleanDesc = rawDesc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();

    // Skip if it contains Philippine tags
    if (phFilterRegex.test(title || '') || phFilterRegex.test(cleanDesc)) {
      continue;
    }

    if (title && link) {
      items.push({
        title,
        description: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
        redirect_url: link,
        source_url: 'https://devpost.com',
        event_start: pubDate ? new Date(pubDate).toISOString() : undefined,
        format: 'online',
        region: 'International',
        poster_image_url: poster
      });
    }
  }

  return items.slice(0, 10);
}

// 7. Devfolio Global JSON API Scraper
async function scrapeDevfolioApi(source: ScrapeSource): Promise<ScrapeResult[]> {
  const queryUrl = 'https://api.devfolio.co/api/hackathons?filter=open&page=1&size=15';
  const res = await fetch(queryUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Devfolio API returned status ${res.status}`);

  const data = await res.json();
  const hackathons = data.result || [];
  if (!Array.isArray(hackathons)) return [];

  const items: ScrapeResult[] = [];
  for (const h of hackathons) {
    const loc = (h.location || '').toLowerCase();
    // Exclude Philippine-only events from foreign crawler
    if (loc.includes('philippines') || loc.includes('manila')) continue;

    items.push({
      title: h.name || 'Devfolio Hackathon',
      description: (h.tagline || h.description || '').slice(0, 300),
      redirect_url: h.slug ? `https://${h.slug}.devfolio.co` : source.url,
      source_url: 'https://devfolio.co',
      event_start: h.starts_at,
      event_end: h.ends_at,
      format: h.is_online ? 'online' : 'in-person',
      region: 'International',
      poster_image_url: h.banner_url || h.logo
    });
  }

  return items.slice(0, 10);
}

// 8. Save Staged Events to Supabase
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

      // Verify reachability of redirect link before saving
      const live = await isLiveUrl(event.redirect_url);
      if (!live) {
        console.warn(`Skipping crawled event "${event.title}" because redirect_url "${event.redirect_url}" is unreachable.`);
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

      // If we don't have a poster image, try to extract the Open Graph image from the target landing page
      let posterUrl = event.poster_image_url;
      if (!posterUrl && event.redirect_url) {
        console.log(`Extracting landing page og:image for: ${event.title}`);
        posterUrl = await scrapeOpenGraphImage(event.redirect_url);
      }

      // Assign region (fallback to source.defaultRegion -> Nationwide)
      const eventRegion = event.region || source.defaultRegion || 'Nationwide';

      // Default values mapping
      const { data: newHack, error } = await supabase
        .from('hackathons')
        .insert({
          title: event.title.slice(0, 100),
          description: event.description || 'Staged event from directory monitoring.',
          organizer_id: organizerId,
          redirect_url: event.redirect_url,
          source_url: event.source_url,
          region: eventRegion,
          format: event.format || 'online',
          event_start: eventStart,
          event_end: eventEnd,
          deadline: eventStart || new Date().toISOString(), // fallback deadline to start if missing
          source_type: 'official_site',
          status: 'published',
          poster_image_url: posterUrl
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

// Helper to fetch and extract og:image from the target landing page
async function scrapeOpenGraphImage(url: string): Promise<string | undefined> {
  try {
    // Avoid scraping social platforms or links that block simple scraping
    if (url.includes('facebook.com') || url.includes('twitter.com') || url.includes('eventbrite.com') || url.includes('instagram.com')) {
      return undefined;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000) // fast 5s timeout to prevent thread blocking
    });

    if (!res.ok) return undefined;

    const html = await res.text();
    const $ = cheerio.load(html);

    let ogImage = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content') ||
                  $('link[rel="image_src"]').attr('href');

    if (ogImage && !ogImage.startsWith('http')) {
      try {
        ogImage = new URL(ogImage, url).toString();
      } catch {
        ogImage = undefined;
      }
    }

    return ogImage || undefined;
  } catch (err) {
    console.error(`Failed to scrape Open Graph image for ${url}:`, err);
    return undefined;
  }
}
