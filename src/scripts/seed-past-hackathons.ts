import * as fs from 'fs';
import * as path from 'path';
import { createBrowserClient } from '@supabase/ssr';

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
}

const PAST_HACKATHONS: HackathonInsert[] = [
  {
    title: 'AI Hackathon (Iloilo City)',
    description: 'A national competition held in Iloilo City by DOST VI. It focused on AI-enabled solutions for the Blue Economy, Tourism, and Clean/Renewable Energy sectors in the region.',
    organizerName: 'DOST VI (Western Visayas)',
    organizerType: 'government',
    sourceUrl: 'https://hackathon.dost6.ph',
    redirectUrl: 'https://hackathon.dost6.ph',
    deadline: '2026-07-28T23:59:59Z',
    eventStart: '2026-08-03T08:00:00Z',
    eventEnd: '2026-08-05T17:00:00Z',
    region: 'Region VI',
    format: 'in-person',
  },
  {
    title: 'FEU Tech Create & Conquer 2026',
    description: 'Organized by the FEU Institute of Technology’s Computer Engineering Organization. This hybrid event challenged high school and undergraduate students to build innovative tech projects.',
    organizerName: 'FEU Institute of Technology',
    organizerType: 'university',
    sourceUrl: 'https://feutech.edu.ph',
    redirectUrl: 'https://feutech.edu.ph/news/create-conquer-2026',
    deadline: '2026-06-15T23:59:59Z',
    eventStart: '2026-06-23T08:00:00Z',
    eventEnd: '2026-06-30T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'Hackathon Manila 2026: Building Design Quest',
    description: 'Held at Crowne Plaza, Ortigas Center, this specialized competition challenged civil engineering students to showcase structural design and analytical skills using ETABS software.',
    organizerName: 'Civil Engineering Society Manila',
    organizerType: 'private',
    sourceUrl: 'https://hackathonmanila.ph',
    redirectUrl: 'https://hackathonmanila.ph/building-design-quest',
    deadline: '2026-05-15T23:59:59Z',
    eventStart: '2026-05-28T08:00:00Z',
    eventEnd: '2026-05-28T18:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'Gosoft Retail Tech Hackathon 2026',
    description: 'A dedicated retail technology sprint focused on building business-oriented tech solutions to elevate digital capabilities and the retail tech ecosystem in the country.',
    organizerName: 'Gosoft Philippines',
    organizerType: 'private',
    sourceUrl: 'https://gosoft.com.ph',
    redirectUrl: 'https://gosoft.com.ph/retail-tech-hackathon',
    deadline: '2026-03-25T23:59:59Z',
    eventStart: '2026-04-04T08:00:00Z',
    eventEnd: '2026-04-04T20:00:00Z',
    region: 'NCR',
    format: 'in-person',
  },
  {
    title: 'Ateneo Blue Hacks 2026',
    description: 'Organized by the Computer Society of the Ateneo (CompSAt). Centered on "Innovating for a Greener Urban Future," 25 teams competed to design sustainable smart city and urban solutions.',
    organizerName: 'Ateneo Computer Society (CompSAt)',
    organizerType: 'university',
    sourceUrl: 'https://ateneo.edu',
    redirectUrl: 'https://ateneo.edu/bluehacks2026',
    deadline: '2026-03-20T23:59:59Z',
    eventStart: '2026-03-28T08:00:00Z',
    eventEnd: '2026-03-29T17:00:00Z',
    region: 'NCR',
    format: 'hybrid',
  },
  {
    title: 'Data and AI Inclusion Hackathon 2026',
    description: 'Convened by the Technological Institute of the Philippines (T.I.P.) and Grundfos. Student teams developed data-powered applications and AI models to solve real-world industry problems.',
    organizerName: 'Technological Institute of the Philippines',
    organizerType: 'university',
    sourceUrl: 'https://tip.edu.ph',
    redirectUrl: 'https://tip.edu.ph/data-ai-inclusion-2026',
    deadline: '2026-02-10T23:59:59Z',
    eventStart: '2026-02-18T08:00:00Z',
    eventEnd: '2026-02-20T17:00:00Z',
    region: 'NCR',
    format: 'in-person',
  }
];

async function main() {
  try {
    loadEnv();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    console.log(`Connecting to: ${url}`);
    
    const supabase = createBrowserClient(url, key);
    let insertedCount = 0;

    for (const item of PAST_HACKATHONS) {
      // 1. Find or insert organizer (using public anonymous access which we enabled via migration 005)
      const { data: existingOrgs } = await supabase
        .from('organizers')
        .select('id')
        .eq('name', item.organizerName);
        
      let organizerId: string;

      if (existingOrgs && existingOrgs.length > 0) {
        organizerId = existingOrgs[0].id;
      } else {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizers')
          .insert({
            name: item.organizerName,
            organizer_type: item.organizerType
          })
          .select('id')
          .single();
          
        if (orgError) {
          console.error(`Error creating organizer ${item.organizerName}:`, orgError);
          continue;
        }
        organizerId = newOrg.id;
      }

      // 2. Check if hackathon already exists
      const { data: existingHacks } = await supabase
        .from('hackathons')
        .select('id')
        .eq('redirect_url', item.redirectUrl);
        
      if (existingHacks && existingHacks.length > 0) {
        console.log(`Skipped (already exists): ${item.title}`);
        continue;
      }

      // 3. Insert hackathon directly as 'published' (since review is bypassed/default is published)
      const { error: hackError } = await supabase
        .from('hackathons')
        .insert({
          title: item.title,
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
          status: 'published' // set to published immediately
        });

      if (hackError) {
        console.error(`Error inserting hackathon ${item.title}:`, hackError);
      } else {
        console.log(`Successfully seeded past event: ${item.title}`);
        insertedCount++;
      }
    }

    console.log(`Seeding complete. Inserted ${insertedCount} historical events.`);
  } catch (err) {
    console.error('Execute error:', err);
  }
}

main();
