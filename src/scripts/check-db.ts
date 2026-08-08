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

async function main() {
  try {
    loadEnv();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    console.log(`Connecting to: ${url}`);
    console.log(`Using Publishable Key: ${key.slice(0, 15)}...`);

    const supabase = createBrowserClient(url, key);

    const { data: hackathons, error } = await supabase
      .from('hackathons')
      .select('*, organizer:organizers(*)');
      
    if (error) {
      console.error('Error fetching hackathons:', error);
    } else {
      console.log(`Found ${hackathons?.length || 0} hackathons in database.`);
      if (hackathons && hackathons.length > 0) {
        hackathons.forEach(h => {
          console.log(`- [${h.status}] ${h.title} (URL: ${h.redirect_url})`);
        });
      }
    }
  } catch (err) {
    console.error('Execute error:', err);
  }
}

main();
