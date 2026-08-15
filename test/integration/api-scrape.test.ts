import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/scrape/route';
import { NextRequest } from 'next/server';

describe('API Route /api/scrape Integration', () => {
  it('returns 401 Unauthorized when no secret key or bearer token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/scrape');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('accepts authorization with valid key query param', async () => {
    const secretKey = process.env.CRON_SECRET || 'local_development_secret';
    // Limit to 0 sources to verify auth passes without triggering heavy network fetches
    const req = new NextRequest(`http://localhost:3000/api/scrape?key=${secretKey}&limit=0`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.processedCount).toBe(0);
  });
});
