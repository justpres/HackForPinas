import * as fs from 'fs';
import * as path from 'path';
import { createAdminClient } from '../lib/supabase/admin';

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
    const supabase = await createAdminClient();
    console.log(`Connecting to: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log('Updating all hackathons in database to "published" status...');
    
    const { data, error } = await supabase
      .from('hackathons')
      .update({ status: 'published' })
      .neq('status', 'published')
      .select();
      
    if (error) {
      console.error('Error updating hackathons status:', error);
    } else {
      console.log(`Successfully updated ${data?.length || 0} hackathons to "published".`);
      if (data && data.length > 0) {
        data.forEach(h => {
          console.log(`- Published: ${h.title}`);
        });
      }
    }
  } catch (err) {
    console.error('Execute error:', err);
  }
}

main();
