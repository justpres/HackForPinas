import { describe, it, expect } from 'vitest';
import { isAllowedDomain } from '@/lib/redirect-validator';

describe('Redirect Validator Unit Tests', () => {
  it('allows Philippine government domains (.gov.ph)', () => {
    const res = isAllowedDomain('https://dict.gov.ph/events/hackathon-2026');
    expect(res.allowed).toBe(true);
    expect(res.domain).toBe('dict.gov.ph');
  });

  it('allows Philippine university domains (.edu.ph)', () => {
    const res = isAllowedDomain('https://up.edu.ph/competitions/codefest');
    expect(res.allowed).toBe(true);
    expect(res.domain).toBe('up.edu.ph');
  });

  it('allows recognized Facebook domains', () => {
    const res1 = isAllowedDomain('https://facebook.com/events/12345');
    expect(res1.allowed).toBe(true);

    const res2 = isAllowedDomain('https://m.facebook.com/groups/philhacks');
    expect(res2.allowed).toBe(true);
  });

  it('rejects disallowed arbitrary domains', () => {
    const res = isAllowedDomain('https://malicious-phishing-site.xyz/login');
    expect(res.allowed).toBe(false);
  });

  it('handles invalid URLs gracefully', () => {
    const res = isAllowedDomain('not-a-valid-url');
    expect(res.allowed).toBe(false);
  });
});
