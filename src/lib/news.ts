import * as cheerio from 'cheerio';
import { isLiveUrl } from './redirect-validator';

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  sourceName: string;
  sourceCategory: 'government' | 'media';
  imageUrl?: string;
}

const NEWS_FEEDS = [
  {
    name: 'DOST ASTI',
    url: 'https://asti.dost.gov.ph/feed/',
    category: 'government' as const
  },
  {
    name: 'Inquirer Tech',
    url: 'https://technology.inquirer.net/feed/',
    category: 'media' as const
  }
];

// Checks if title or description matches developer/hackathon technology keywords
function isRelevantTechNews(title: string, description: string): boolean {
  const keywords = /hackathon|competition|coding|challenge|programming|startup|innovation|cybersecurity|developer|software|AI|artificial intelligence|robotics|machine learning|ICT|digital|technology|telecom|hack|data science/i;
  return keywords.test(title) || keywords.test(description);
}

// Clean HTML tags from RSS strings and decode entities
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ') // strip html tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ') // replace multiple spaces with single space
    .trim();
}

// Extract first img src from HTML content
function extractImage(htmlContent: string): string | undefined {
  if (!htmlContent) return undefined;
  const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
  if (match && match[1]) {
    // Basic verification of image URL
    if (match[1].startsWith('http') || match[1].startsWith('//')) {
      return match[1].startsWith('//') ? `https:${match[1]}` : match[1];
    }
  }
  return undefined;
}

export async function fetchTechNews(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  const promises = NEWS_FEEDS.map(async (feed) => {
    try {
      console.log(`Fetching RSS feed: ${feed.name} (${feed.url})`);
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(6000), // 6s timeout to prevent block
        next: { revalidate: 3600 } // cache for 1 hour
      });

      if (!res.ok) {
        console.error(`Feed ${feed.name} returned status ${res.status}`);
        return;
      }

      const xmlText = await res.text();
      const $ = cheerio.load(xmlText, { xmlMode: true });

      const items: NewsItem[] = [];

      $('item').each((_, el) => {
        const titleRaw = $(el).find('title').text();
        const link = $(el).find('link').text() || $(el).find('comments').text() || '';
        const descriptionRaw = $(el).find('description').text() || $(el).find('content\\:encoded').text() || '';
        const pubDateRaw = $(el).find('pubDate').text();

        const title = cleanText(titleRaw);
        const description = cleanText(descriptionRaw);

        // Filter by relevance
        if (title && isRelevantTechNews(title, description)) {
          // Try to extract image from content description
          const imageUrl = extractImage($(el).find('content\\:encoded').text() || descriptionRaw);

          items.push({
            title,
            link: link.trim(),
            description: description.slice(0, 220) + (description.length > 220 ? '...' : ''),
            pubDate: pubDateRaw ? new Date(pubDateRaw).toISOString() : new Date().toISOString(),
            sourceName: feed.name,
            sourceCategory: feed.category,
            imageUrl
          });
        }
      });

      // Filter out dead links for newly parsed feed items (cap to 10 verified items per feed to avoid performance hit)
      const verifiedItems: NewsItem[] = [];
      const limitedItems = items.slice(0, 15);
      
      for (const item of limitedItems) {
        if (item.link) {
          const live = await isLiveUrl(item.link);
          if (live) {
            verifiedItems.push(item);
          }
        }
      }

      allItems.push(...verifiedItems);
      console.log(`Feed ${feed.name} processed successfully: found ${verifiedItems.length} verified relevant articles.`);
    } catch (err: any) {
      console.error(`Error processing feed ${feed.name}:`, err.message || err);
    }
  });

  await Promise.allSettled(promises);

  // Sort articles chronologically, newest first
  return allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
