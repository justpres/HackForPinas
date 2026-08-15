import { describe, it, expect } from 'vitest';
import { REGIONS, FORMATS, ORGANIZER_TYPES, STATUSES, SORT_OPTIONS } from '@/lib/constants';

describe('Constants & Types Integrity', () => {
  it('includes International in REGIONS list', () => {
    expect(REGIONS).toContain('International');
    expect(REGIONS).toContain('NCR');
    expect(REGIONS).toContain('Nationwide');
  });

  it('declares standard format types', () => {
    expect(FORMATS).toContain('online');
    expect(FORMATS).toContain('in-person');
    expect(FORMATS).toContain('hybrid');
  });

  it('declares valid organizer types', () => {
    expect(ORGANIZER_TYPES).toContain('government');
    expect(ORGANIZER_TYPES).toContain('university');
    expect(ORGANIZER_TYPES).toContain('private');
  });

  it('declares expected statuses', () => {
    expect(STATUSES).toContain('pending_review');
    expect(STATUSES).toContain('published');
    expect(STATUSES).toContain('rejected');
    expect(STATUSES).toContain('expired');
  });

  it('provides valid sort options', () => {
    const sortValues = SORT_OPTIONS.map((s) => s.value);
    expect(sortValues).toContain('deadline');
    expect(sortValues).toContain('newest');
  });
});
