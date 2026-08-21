import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/submissions/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/redirect-validator', () => ({
  validateRedirectUrl: vi.fn(async (url: string) => {
    if (url.includes('unauthorized-phishing-domain')) {
      return { valid: false, reason: 'Domain not in allow-list' };
    }
    return { valid: true };
  }),
}));

describe('API Route /api/submissions Integration', () => {
  it('returns 400 Validation failed for empty body or missing required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Validation failed');
    expect(json.fields).toBeDefined();
  });

  it('rejects disallowed redirect URLs with 400', async () => {
    const invalidPayload = {
      title: 'Suspicious Phishing Contest',
      description: 'A contest asking for sensitive user credentials on an unknown host',
      organizer_name: 'Unknown Org',
      organizer_type: 'private',
      region: 'NCR',
      format: 'online',
      source_url: 'https://unauthorized-phishing-domain.xyz',
      redirect_url: 'https://unauthorized-phishing-domain.xyz/login',
      deadline: '2026-10-01T00:00:00Z',
      contact_email: 'contact@example.com',
    };

    const req = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('rejects insecure HTTP poster image URLs with 400', async () => {
    const invalidImagePayload = {
      title: 'Valid Philippine Hackathon',
      description: 'A genuine tech competition for university students across Metro Manila',
      organizer_name: 'DICT Philippines',
      organizer_type: 'government',
      region: 'NCR',
      format: 'in-person',
      source_url: 'https://dict.gov.ph',
      redirect_url: 'https://dict.gov.ph/events/hackathon',
      poster_image_url: 'http://insecure-image-host.com/banner.jpg',
      deadline: '2026-10-01T00:00:00Z',
      contact_email: 'events@dict.gov.ph',
    };

    const req = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify(invalidImagePayload),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Poster image URL must use secure HTTPS protocol');
  });

  it('rejects unverified poster image domains with 400', async () => {
    const unverifiedDomainPayload = {
      title: 'Valid Philippine Hackathon',
      description: 'A genuine tech competition for university students across Metro Manila',
      organizer_name: 'DICT Philippines',
      organizer_type: 'government',
      region: 'NCR',
      format: 'in-person',
      source_url: 'https://dict.gov.ph',
      redirect_url: 'https://dict.gov.ph/events/hackathon',
      poster_image_url: 'https://unverified-random-cdn.xyz/not-an-image',
      deadline: '2026-10-01T00:00:00Z',
      contact_email: 'events@dict.gov.ph',
    };

    const req = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify(unverifiedDomainPayload),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Poster image URL must link to a valid image source');
  });
});
