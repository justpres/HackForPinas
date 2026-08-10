import * as fs from 'fs';
import * as path from 'path';
import { createBrowserClient } from '@supabase/ssr';

// Define structures
interface HackathonInsert {
  title: string;
  description: string;
  organizerName: string;
  organizerType: 'government' | 'university' | 'private';
  sourceUrl: string;
  redirectUrl: string;
  deadline: string;
  eventStart: string;
  eventEnd: string;
  region: string;
  format: 'online' | 'in-person' | 'hybrid';
  poster_image_url?: string;
}

// Curated prestigious hackathons from January 2020 to August 2026
const CURATED_HISTORICAL_HACKATHONS: HackathonInsert[] = [
  {
    title: 'DICT eGovPH Hackathon 2026',
    description: 'A flagship national competition challenging participants to develop digital solutions leveraging the eGovPH platform, National ID, and single sign-on APIs for public service.',
    organizerName: 'DICT (Department of Information and Communications Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dict.gov.ph',
    redirectUrl: 'https://dict.gov.ph',
    deadline: '2026-07-15T23:59:59Z',
    eventStart: '2026-07-21T08:00:00Z',
    eventEnd: '2026-07-22T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'DICT OpenGov Hackathon 2025',
    description: 'An open governance challenge focusing on AI-driven platforms and transparency tools to build citizen trust and elevate public sector efficiency.',
    organizerName: 'DICT (Department of Information and Communications Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dict.gov.ph',
    redirectUrl: 'https://dict.gov.ph',
    deadline: '2025-05-15T23:59:59Z',
    eventStart: '2025-05-22T08:00:00Z',
    eventEnd: '2025-05-23T17:00:00Z',
    region: 'Nationwide',
    format: 'hybrid',
  },
  {
    title: 'Hack4Gov National Finals 2024',
    description: 'The annual cybersecurity hackathon organized by DICT-NCIAC, raising awareness and cybersecurity capability among university students and tech enthusiasts.',
    organizerName: 'DICT (Department of Information and Communications Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dict.gov.ph',
    redirectUrl: 'https://dict.gov.ph',
    deadline: '2024-10-15T23:59:59Z',
    eventStart: '2024-10-22T08:00:00Z',
    eventEnd: '2024-10-23T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'DICT Hack4Gov 2023',
    description: 'A cybersecurity and digital defense coding simulation and attack-defense challenge held for students and practitioners across the regions.',
    organizerName: 'DICT (Department of Information and Communications Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dict.gov.ph',
    redirectUrl: 'https://dict.gov.ph',
    deadline: '2023-09-10T23:59:59Z',
    eventStart: '2023-09-18T08:00:00Z',
    eventEnd: '2023-09-20T17:00:00Z',
    region: 'Nationwide',
    format: 'in-person',
  },
  {
    title: 'DICT Hack4Gov 2022',
    description: 'A nationwide cyber-drill and security competition organized by DICT to train security developers and engineers in defensive software practices.',
    organizerName: 'DICT (Department of Information and Communications Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dict.gov.ph',
    redirectUrl: 'https://dict.gov.ph',
    deadline: '2022-10-05T23:59:59Z',
    eventStart: '2022-10-15T08:00:00Z',
    eventEnd: '2022-10-16T17:00:00Z',
    region: 'Nationwide',
    format: 'hybrid',
  },
  {
    title: 'DOST National AI Fest Hackathon 2025',
    description: 'A premier national AI competition held during the AI Fest at the Iloilo Convention Center, challenging developers to build AI solutions for agricultural productivity and local governance.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2025-08-01T23:59:59Z',
    eventStart: '2025-08-11T08:00:00Z',
    eventEnd: '2025-08-13T17:00:00Z',
    region: 'Region VI (Western Visayas)',
    format: 'in-person',
  },
  {
    title: 'DOST Resilience Dividend Hackathon 2026',
    description: 'Convened by DOST, UNDP, and Australia, this hackathon focused on engineering disaster risk reduction systems, early warning alerts, and climate resilience models.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2026-04-20T23:59:59Z',
    eventStart: '2026-04-28T08:00:00Z',
    eventEnd: '2026-04-29T17:00:00Z',
    region: 'Nationwide',
    format: 'hybrid',
  },
  {
    title: 'NASA Space Apps Challenge Philippines 2024',
    description: 'The Manila chapter of the global hackathon, inviting coders, scientists, designers, and builders to address real-world challenges on Earth and in space using NASA open data.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2024-09-30T23:59:59Z',
    eventStart: '2024-10-05T08:00:00Z',
    eventEnd: '2024-10-06T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'NASA Space Apps Challenge Philippines 2023',
    description: 'Addressing planetary problems and environmental data challenges using NASA Earth observation datasets and public satellites.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2023-09-28T23:59:59Z',
    eventStart: '2023-10-07T08:00:00Z',
    eventEnd: '2023-10-08T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'NASA Space Apps Challenge Philippines 2022',
    description: 'Developing tools for space observation and public climate monitoring, engaging hundreds of student developers.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2022-09-25T23:59:59Z',
    eventStart: '2022-10-01T08:00:00Z',
    eventEnd: '2022-10-02T17:00:00Z',
    region: 'NCR',
    format: 'online',
  },
  {
    title: 'NASA Space Apps Challenge Philippines 2021',
    description: 'Virtual space hackathon addressing environmental, maritime, and public health threats using satellite telemetry.',
    organizerName: 'DOST (Department of Science and Technology)',
    organizerType: 'government',
    sourceUrl: 'https://dost.gov.ph',
    redirectUrl: 'https://dost.gov.ph',
    deadline: '2021-09-20T23:59:59Z',
    eventStart: '2021-10-02T08:00:00Z',
    eventEnd: '2021-10-03T17:00:00Z',
    region: 'Nationwide',
    format: 'online',
  },
  {
    title: 'Ateneo Blue Hacks 2024',
    description: 'The annual premier student-run hackathon organized by CompSAt, empowering participants to conceptualize, prototype, and pitch digital products targeting local societal issues.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu',
    deadline: '2024-04-20T23:59:59Z',
    eventStart: '2024-04-27T08:00:00Z',
    eventEnd: '2024-04-28T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'Ateneo Blue Hacks 2025',
    description: 'Focusing on smart-city and AI integrations, CompSAt Blue Hacks 2025 challenged developers to build applications for environmental preservation and public transport optimization.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu',
    deadline: '2025-03-22T23:59:59Z',
    eventStart: '2025-03-29T08:00:00Z',
    eventEnd: '2025-03-30T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'Ateneo Blue Hacks 2023',
    description: 'Empowering students to design web technologies supporting education equity and small business post-pandemic adaptation.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu',
    deadline: '2023-03-15T23:59:59Z',
    eventStart: '2023-03-25T08:00:00Z',
    eventEnd: '2023-03-26T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'Ateneo Blue Hacks 2022',
    description: 'Under the theme of digital empowerment, the 2022 hackathon focused on web resources for public healthcare and medical access.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu',
    deadline: '2022-03-10T23:59:59Z',
    eventStart: '2022-03-19T08:00:00Z',
    eventEnd: '2022-03-20T17:00:00Z',
    region: 'NCR',
    format: 'online',
  },
  {
    title: 'Ateneo Blue Hacks 2021',
    description: 'A fully virtual hackathon challenge targeting sustainable development goals and digital tools for virtual learning.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu',
    deadline: '2021-03-05T23:59:59Z',
    eventStart: '2021-03-13T08:00:00Z',
    eventEnd: '2021-03-14T17:00:00Z',
    region: 'NCR',
    format: 'online',
  },
  {
    title: 'DEVCON CodeCamp Hackathon 2025',
    description: 'A massive developer camp and hackathon organized by DEVCON, bringing developers together to solve real-world open source issues and build community tools.',
    organizerName: 'DEVCON Philippines',
    organizerType: 'private',
    sourceUrl: 'https://devcon.ph',
    redirectUrl: 'https://devcon.ph',
    deadline: '2025-11-10T23:59:59Z',
    eventStart: '2025-11-15T08:00:00Z',
    eventEnd: '2025-11-16T17:00:00Z',
    region: 'Nationwide',
    format: 'hybrid',
  },
  {
    title: 'DEVCON Kids Hackathon 2024',
    description: 'A special program introducing young minds (ages 8-15) to programming, logic building, and visual coding tools to solve simple daily challenges.',
    organizerName: 'DEVCON Philippines',
    organizerType: 'private',
    sourceUrl: 'https://devcon.ph',
    redirectUrl: 'https://devcon.ph',
    deadline: '2024-10-05T23:59:59Z',
    eventStart: '2024-10-12T08:00:00Z',
    eventEnd: '2024-10-12T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'DEVCON Summit 2023 Hackathon',
    description: 'The flagship developer summit hackathon, focusing on building high-performance decentralized systems, Web3 utilities, and scalable enterprise APIs.',
    organizerName: 'DEVCON Philippines',
    organizerType: 'private',
    sourceUrl: 'https://devcon.ph',
    redirectUrl: 'https://devcon.ph',
    deadline: '2023-11-10T23:59:59Z',
    eventStart: '2023-11-18T08:00:00Z',
    eventEnd: '2023-11-19T17:00:00Z',
    region: 'Nationwide',
    format: 'in-person',
  },
  {
    title: 'FEU Tech Create & Conquer 2025',
    description: 'Organized by the FEU Tech computer department, this competition tasks undergraduate engineers with designing web and mobile solutions for smart cities and education.',
    organizerName: 'FEU Institute of Technology',
    organizerType: 'university',
    sourceUrl: 'https://feutech.edu.ph',
    redirectUrl: 'https://feutech.edu.ph',
    deadline: '2025-06-15T23:59:59Z',
    eventStart: '2025-06-20T08:00:00Z',
    eventEnd: '2025-06-22T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'FEU Tech Create & Conquer 2024',
    description: 'High school and college coding competition for crafting cloud-based solutions and automation algorithms using open platforms.',
    organizerName: 'FEU Institute of Technology',
    organizerType: 'university',
    sourceUrl: 'https://feutech.edu.ph',
    redirectUrl: 'https://feutech.edu.ph',
    deadline: '2024-06-10T23:59:59Z',
    eventStart: '2024-06-18T08:00:00Z',
    eventEnd: '2024-06-20T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'FEU Tech Create & Conquer 2023',
    description: 'A technology challenge focused on desktop programming, robotics interfacing, and algorithmic efficiency for student builders.',
    organizerName: 'FEU Institute of Technology',
    organizerType: 'university',
    sourceUrl: 'https://feutech.edu.ph',
    redirectUrl: 'https://feutech.edu.ph',
    deadline: '2023-06-05T23:59:59Z',
    eventStart: '2023-06-12T08:00:00Z',
    eventEnd: '2023-06-14T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'Impact Hackathon 2021',
    description: 'Part of the Impact 2021 initiative, focusing on smart agriculture, environmental tech, and healthcare access digital platforms across the Philippines.',
    organizerName: 'Impact Hub Manila',
    organizerType: 'private',
    sourceUrl: 'https://impacthub.ph',
    redirectUrl: 'https://impacthub.ph',
    deadline: '2021-11-20T23:59:59Z',
    eventStart: '2021-11-26T08:00:00Z',
    eventEnd: '2021-11-28T17:00:00Z',
    region: 'Nationwide',
    format: 'online',
  },
  {
    title: 'Impact Hackathon 2020',
    description: 'The massive national record-breaking hackathon focusing on agriculture, climate change, education, health, and financial inclusion.',
    organizerName: 'Impact Hub Manila',
    organizerType: 'private',
    sourceUrl: 'https://impacthub.ph',
    redirectUrl: 'https://impacthub.ph',
    deadline: '2020-10-15T23:59:59Z',
    eventStart: '2020-10-23T08:00:00Z',
    eventEnd: '2020-10-25T17:00:00Z',
    region: 'Nationwide',
    format: 'online',
  }
];

// Helper to load environment variables from .env file
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        if (key) {
          process.env[key] = val.trim();
        }
      }
    });
  }
}

// Date range filters (expanded to January 2020 to December 2035)
const START_DATE = new Date('2020-01-01T00:00:00Z');
const END_DATE = new Date('2035-12-31T23:59:59Z');

function isWithinPeriod(dateObj: Date): boolean {
  return dateObj >= START_DATE && dateObj <= END_DATE;
}

// Parse Devpost Date strings, e.g. "Jul 01 - Aug 01, 2026" or "Aug 04 - 31, 2026"
function parseDevpostDates(dateStr: string): { start: Date; end: Date } {
  const cleanStr = dateStr.trim().replace(/\s+/g, ' ');
  const parts = cleanStr.split('-').map(p => p.trim());
  
  if (parts.length === 1) {
    const d = new Date(parts[0]);
    return { start: d, end: d };
  }
  
  const part1 = parts[0];
  const part2 = parts[1];
  
  const yearMatch = part2.match(/,\s*(\d{4})/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
  
  let startDate: Date;
  let endDate: Date;
  
  const part1YearMatch = part1.match(/,\s*(\d{4})/);
  
  if (part1YearMatch) {
    startDate = new Date(part1);
    endDate = new Date(part2);
  } else {
    const monthMatch = part1.match(/^([A-Za-z]+)\s+(\d+)/);
    if (monthMatch) {
      const month = monthMatch[1];
      const day = monthMatch[2];
      startDate = new Date(`${month} ${day}, ${year}`);
    } else {
      startDate = new Date();
    }
    
    const part2Clean = part2.replace(/,\s*\d{4}/, '');
    const part2MonthMatch = part2Clean.match(/^([A-Za-z]+)\s+(\d+)/);
    
    if (part2MonthMatch) {
      endDate = new Date(part2);
    } else {
      const day = part2Clean.trim();
      const monthMatch = part1.match(/^([A-Za-z]+)/);
      const month = monthMatch ? monthMatch[1] : 'Jan';
      endDate = new Date(`${month} ${day}, ${year}`);
    }
  }
  
  return { start: startDate, end: endDate };
}

// Link reachability check
async function checkLinkReachable(url: string): Promise<boolean> {
  try {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return true;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });
    return res.status < 400;
  } catch (error: any) {
    console.warn(`  Reachability check failed for ${url}: ${error.message || error}`);
    return false;
  }
}

// Event legitimacy check
function isEventLegitimate(title: string, description: string): boolean {
  const keywords = /hackathon|competition|coding|challenge|programming|startup|innovation|hack|builder|develop|tech/i;
  return keywords.test(title) || keywords.test(description);
}

// Organizer verification logic
function shouldVerifyOrganizer(name: string): boolean {
  const upperName = name.toUpperCase();
  return upperName.includes('DICT') || upperName.includes('DOST') || upperName.includes('GDG');
}

// Detect Organizer Type based on name
function detectOrganizerType(name: string): 'government' | 'university' | 'private' {
  const upperName = name.toUpperCase();
  if (upperName.includes('DICT') || upperName.includes('DOST') || upperName.includes('GOV') || upperName.includes('DEPARTMENT')) {
    return 'government';
  }
  if (upperName.includes('UNIVERSITY') || upperName.includes('ATENEO') || upperName.includes('FEU') || upperName.includes('UP ') || upperName.includes('COLLEGE') || upperName.includes('INSTITUTE') || upperName.includes('COMPSAT') || upperName.includes('DLSU')) {
    return 'university';
  }
  return 'private';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Scrape Devpost API for ended, open, and upcoming events targeted at Philippines
async function scrapeDevpost(): Promise<HackathonInsert[]> {
  console.log('\n--- Scraping Devpost JSON API ---');
  const statuses = ['ended', 'open', 'upcoming'];
  const events: HackathonInsert[] = [];

  for (const status of statuses) {
    // Iterate through pages 1 to 40 to grab all historical records back to 2020
    for (let page = 1; page <= 40; page++) {
      const url = `https://devpost.com/api/hackathons?keywords=Philippines&status[]=${status}&page=${page}`;
      try {
        await delay(300); // 300ms throttle to prevent rate blocking
        
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
          console.error(`  Devpost API error: ${status} page ${page} returned status ${res.status}`);
          break;
        }

        const data = await res.json();
        const hackathons = data.hackathons;
        if (!Array.isArray(hackathons) || hackathons.length === 0) {
          console.log(`  No more results for status "${status}" at page ${page}`);
          break; 
        }

        console.log(`  Fetched page ${page} for status "${status}" - Found ${hackathons.length} raw events`);

        for (const item of hackathons) {
          const title = item.title;
          const host = item.organization_name || 'Devpost Community';
          const redirect = item.url;
          const dateStr = item.submission_period_dates;
          
          if (!dateStr) continue;

          // Parse dates
          let parsedDates;
          try {
            parsedDates = parseDevpostDates(dateStr);
          } catch (e) {
            continue;
          }

          // Check if dates are within the past window (Jan 2020 - Aug 2026)
          if (!isWithinPeriod(parsedDates.start) && !isWithinPeriod(parsedDates.end)) {
            continue;
          }

          // Themes mapping to description
          const themes = Array.isArray(item.themes) ? item.themes.map((t: any) => t.name).join(', ') : '';
          const desc = themes 
            ? `Themes: ${themes}. A developer challenge hosted on Devpost by ${host}.`
            : `A developer challenge hosted on Devpost by ${host}.`;

          // Format check
          const locStr = item.displayed_location?.location || '';
          const format: 'online' | 'in-person' | 'hybrid' = locStr.toLowerCase().includes('online') 
            ? 'online' 
            : (locStr.toLowerCase().includes('hybrid') ? 'hybrid' : 'in-person');

          // Poster Image
          let posterUrl = item.thumbnail_url;
          if (posterUrl && posterUrl.startsWith('//')) {
            posterUrl = 'https:' + posterUrl;
          }

          events.push({
            title,
            description: desc,
            organizerName: host,
            organizerType: detectOrganizerType(host),
            sourceUrl: 'https://devpost.com',
            redirectUrl: redirect,
            deadline: parsedDates.end.toISOString(),
            eventStart: parsedDates.start.toISOString(),
            eventEnd: parsedDates.end.toISOString(),
            region: 'Nationwide',
            format,
            poster_image_url: posterUrl || undefined
          });
        }
      } catch (error: any) {
        console.error(`  Error fetching Devpost API ${status} page ${page}:`, error.message || error);
        break;
      }
    }
  }

  console.log(`Devpost API: Collected ${events.length} valid events matching filters.`);
  return events;
}

async function main() {
  try {
    loadEnv();
    
    // Parse arguments
    const isExecute = process.argv.includes('--execute');
    const isDryRun = !isExecute;

    console.log('==================================================');
    console.log(`HISTORICAL HACKATHON SCRAPER & SEEDER`);
    console.log(`Mode: ${isDryRun ? 'DRY-RUN (will NOT save to DB)' : 'EXECUTE (will save to DB)'}`);
    console.log('==================================================');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    
    console.log(`Connecting to Supabase URL: ${supabaseUrl}`);
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    // Get Devpost & Curated events
    const devpostEvents = await scrapeDevpost();
    const curatedEvents = CURATED_HISTORICAL_HACKATHONS;

    // Combine
    const allCandidates = [...curatedEvents, ...devpostEvents];
    console.log(`\nTotal candidate events loaded: ${allCandidates.length}`);

    // Deduplicate candidates by redirectUrl internally
    const uniqueCandidatesMap = new Map<string, HackathonInsert>();
    for (const c of allCandidates) {
      uniqueCandidatesMap.set(c.redirectUrl, c);
    }
    const uniqueCandidates = Array.from(uniqueCandidatesMap.values());
    console.log(`Unique candidate events after internal deduplication: ${uniqueCandidates.length}`);

    let processedCount = 0;
    let seededCount = 0;
    let skippedExistingCount = 0;
    let skippedUnreachableCount = 0;

    const seededList: string[] = [];

    for (const item of uniqueCandidates) {
      processedCount++;
      console.log(`\n[${processedCount}/${uniqueCandidates.length}] Processing: "${item.title}"`);
      console.log(`  Organizer: ${item.organizerName} (${item.organizerType})`);
      console.log(`  Link: ${item.redirectUrl}`);
      console.log(`  Dates: Start: ${item.eventStart.split('T')[0]}, End: ${item.eventEnd.split('T')[0]}`);

      // 1. Check if event already exists in DB (deduplicate via redirect_url)
      const { data: existingHackathon, error: queryError } = await supabase
        .from('hackathons')
        .select('id, title')
        .eq('redirect_url', item.redirectUrl)
        .maybeSingle();

      if (queryError) {
        console.error(`  Error querying database:`, queryError);
      }

      if (existingHackathon) {
        console.log(`  -> Skipped: Already exists in database as ID: ${existingHackathon.id}`);
        skippedExistingCount++;
        continue;
      }

      // 2. Reachability validation (Strict: must return HTTP < 400)
      console.log(`  -> Validating redirect link reachability...`);
      const isReachable = await checkLinkReachable(item.redirectUrl);
      if (!isReachable) {
        console.warn(`  -> Skipped: Link is dead or unreachable.`);
        skippedUnreachableCount++;
        continue;
      }
      console.log(`  -> Link is live and reachable!`);

      // 3. Determine Organizer verification status
      const isVerified = shouldVerifyOrganizer(item.organizerName);
      console.log(`  -> Verification Status: is_verified = ${isVerified}`);

      // 4. Save to Database
      if (isDryRun) {
        console.log(`  [DRY-RUN] Would create organizer and insert hackathon as "published"`);
        seededCount++;
        seededList.push(`${item.title} (Organizer: ${item.organizerName}, verified=${isVerified})`);
      } else {
        // Real Execution:
        // A. Get or create organizer
        const { data: existingOrg } = await supabase
          .from('organizers')
          .select('id, is_verified')
          .eq('name', item.organizerName)
          .maybeSingle();

        let organizerId: string;

        if (existingOrg) {
          organizerId = existingOrg.id;
          // Sync verification state if needed
          if (existingOrg.is_verified !== isVerified) {
            console.log(`  -> Updating organizer verification to ${isVerified}`);
            await supabase
              .from('organizers')
              .update({ is_verified: isVerified })
              .eq('id', organizerId);
          }
        } else {
          console.log(`  -> Creating new organizer in DB...`);
          const { data: newOrg, error: orgError } = await supabase
            .from('organizers')
            .insert({
              name: item.organizerName,
              organizer_type: item.organizerType,
              is_verified: isVerified
            })
            .select('id')
            .single();

          if (orgError || !newOrg) {
            console.error(`  -> Failed to create organizer:`, orgError);
            continue;
          }
          organizerId = newOrg.id;
        }

        // B. Insert hackathon directly as 'published'
        console.log(`  -> Inserting hackathon into DB as "published"...`);
        const { data: newHack, error: hackError } = await supabase
          .from('hackathons')
          .insert({
            title: item.title.slice(0, 100),
            description: item.description,
            organizer_id: organizerId,
            source_type: 'official_site',
            source_url: item.sourceUrl,
            redirect_url: item.redirectUrl,
            deadline: item.deadline,
            event_start: item.eventStart,
            event_end: item.eventEnd,
            region: item.region,
            format: item.format,
            status: 'published',
            poster_image_url: item.poster_image_url || null
          })
          .select('id')
          .single();

        if (hackError || !newHack) {
          console.error(`  -> Failed to insert hackathon:`, hackError);
          continue;
        }

        // C. Write to audit log
        await supabase.from('submissions_audit_log').insert({
          hackathon_id: newHack.id,
          action: 'submitted',
          actor: 'community',
          notes: `Seeded via historical hackathon scraper run (expanded back to 2020).`
        });

        console.log(`  -> Success! Seeded hackathon ID: ${newHack.id}`);
        seededCount++;
        seededList.push(`${item.title} (Organizer: ${item.organizerName}, verified=${isVerified})`);
      }
    }

    console.log('\n==================================================');
    console.log('SUMMARY OF RESULTS');
    console.log('==================================================');
    console.log(`Total Candidates Processed: ${uniqueCandidates.length}`);
    console.log(`Already Existed in DB:      ${skippedExistingCount}`);
    console.log(`Skipped (Dead Links):       ${skippedUnreachableCount}`);
    console.log(`Seeded / Simulated:         ${seededCount}`);
    console.log('\nList of Seeded / Simulated Hackathons:');
    seededList.forEach(e => console.log(`- ${e}`));
    console.log('==================================================');
    
    if (isDryRun) {
      console.log('To write these changes to the database, run the script with the --execute flag:');
      console.log('npx tsx src/scripts/scrape-historical-hackathons.ts --execute');
    }
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

main();
