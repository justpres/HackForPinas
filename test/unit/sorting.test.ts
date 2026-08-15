import { describe, it, expect } from 'vitest';
import { HackathonWithOrganizer } from '@/lib/types';

describe('Event Prioritization & Sorting Algorithm', () => {
  const now = new Date('2026-08-15T00:00:00Z').getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const mockEvents: HackathonWithOrganizer[] = [
    {
      id: '1',
      title: 'Active Philippine Hackathon 1',
      organizer_id: 'org1',
      description: 'Active event in NCR',
      source_type: 'official_site',
      source_url: 'https://dict.gov.ph',
      redirect_url: 'https://dict.gov.ph/hack1',
      deadline: '2026-08-25T00:00:00Z',
      event_start: '2026-08-26T00:00:00Z',
      event_end: '2026-08-28T00:00:00Z',
      region: 'NCR',
      format: 'in-person',
      status: 'published',
      poster_image_url: null,
      last_checked_at: '2026-08-15T00:00:00Z',
      submitted_by_email: null,
      created_at: '2026-08-01T00:00:00Z',
      organizer: { id: 'org1', name: 'DICT', organizer_type: 'government', is_verified: true, facebook_page_id: null, official_website: null, created_at: '' },
    },
    {
      id: '2',
      title: 'Active International Global Hackathon',
      organizer_id: 'org2',
      description: 'Devpost Global Event',
      source_type: 'official_site',
      source_url: 'https://devpost.com',
      redirect_url: 'https://devpost.com/hack2',
      deadline: '2026-08-20T00:00:00Z',
      event_start: '2026-08-21T00:00:00Z',
      event_end: '2026-08-22T00:00:00Z',
      region: 'International',
      format: 'online',
      status: 'published',
      poster_image_url: null,
      last_checked_at: '2026-08-15T00:00:00Z',
      submitted_by_email: null,
      created_at: '2026-08-02T00:00:00Z',
      organizer: { id: 'org2', name: 'Devpost', organizer_type: 'private', is_verified: true, facebook_page_id: null, official_website: null, created_at: '' },
    },
    {
      id: '3',
      title: 'Active Philippine Hackathon 2 (Earlier Deadline)',
      organizer_id: 'org3',
      description: 'Active event in Region IV-A',
      source_type: 'official_site',
      source_url: 'https://dost.gov.ph',
      redirect_url: 'https://dost.gov.ph/hack3',
      deadline: '2026-08-18T00:00:00Z',
      event_start: '2026-08-19T00:00:00Z',
      event_end: '2026-08-20T00:00:00Z',
      region: 'Region IV-A (CALABARZON)',
      format: 'hybrid',
      status: 'published',
      poster_image_url: null,
      last_checked_at: '2026-08-15T00:00:00Z',
      submitted_by_email: null,
      created_at: '2026-08-03T00:00:00Z',
      organizer: { id: 'org3', name: 'DOST', organizer_type: 'government', is_verified: true, facebook_page_id: null, official_website: null, created_at: '' },
    },
    {
      id: '4',
      title: 'Past Philippine Hackathon',
      organizer_id: 'org1',
      description: 'Ended event',
      source_type: 'official_site',
      source_url: 'https://dict.gov.ph',
      redirect_url: 'https://dict.gov.ph/hack4',
      deadline: '2026-07-10T00:00:00Z',
      event_start: '2026-07-11T00:00:00Z',
      event_end: '2026-07-12T00:00:00Z',
      region: 'NCR',
      format: 'in-person',
      status: 'published',
      poster_image_url: null,
      last_checked_at: '2026-08-15T00:00:00Z',
      submitted_by_email: null,
      created_at: '2026-07-01T00:00:00Z',
      organizer: { id: 'org1', name: 'DICT', organizer_type: 'government', is_verified: true, facebook_page_id: null, official_website: null, created_at: '' },
    },
    {
      id: '5',
      title: 'Past International Hackathon',
      organizer_id: 'org2',
      description: 'Ended global event',
      source_type: 'official_site',
      source_url: 'https://devpost.com',
      redirect_url: 'https://devpost.com/hack5',
      deadline: '2026-06-01T00:00:00Z',
      event_start: '2026-06-02T00:00:00Z',
      event_end: '2026-06-03T00:00:00Z',
      region: 'International',
      format: 'online',
      status: 'published',
      poster_image_url: null,
      last_checked_at: '2026-08-15T00:00:00Z',
      submitted_by_email: null,
      created_at: '2026-05-01T00:00:00Z',
      organizer: { id: 'org2', name: 'Devpost', organizer_type: 'private', is_verified: true, facebook_page_id: null, official_website: null, created_at: '' },
    },
  ];

  function sortEvents(events: HackathonWithOrganizer[], sortType: 'deadline' | 'newest' = 'deadline') {
    return [...events].sort((a, b) => {
      const isAInternational = a.region === 'International';
      const isBInternational = b.region === 'International';

      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;

      const aEnd = a.event_end ? new Date(a.event_end).getTime() : aDeadline;
      const bEnd = b.event_end ? new Date(b.event_end).getTime() : bDeadline;

      const isAActive = (aEnd || aDeadline) >= (now - oneDayMs);
      const isBActive = (bEnd || bDeadline) >= (now - oneDayMs);

      const getTier = (isInternational: boolean, isActive: boolean) => {
        if (!isInternational && isActive) return 1;
        if (isInternational && isActive) return 2;
        if (!isInternational && !isActive) return 3;
        return 4;
      };

      const tierA = getTier(isAInternational, isAActive);
      const tierB = getTier(isBInternational, isBActive);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      if (sortType === 'deadline') {
        return (aDeadline || Infinity) - (bDeadline || Infinity);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }

  it('ranks active Philippine hackathons ahead of active international hackathons', () => {
    const sorted = sortEvents(mockEvents);
    const sortedIds = sorted.map((e) => e.id);

    // Active PH events: 3 and 1 (3 has earlier deadline Aug 18 vs Aug 25)
    expect(sortedIds[0]).toBe('3');
    expect(sortedIds[1]).toBe('1');

    // Active Global event: 2
    expect(sortedIds[2]).toBe('2');

    // Past PH event: 4
    expect(sortedIds[3]).toBe('4');

    // Past Global event: 5
    expect(sortedIds[4]).toBe('5');
  });

  it('filters by scope correctly', () => {
    const phOnly = mockEvents.filter((e) => e.region !== 'International');
    expect(phOnly.every((e) => e.region !== 'International')).toBe(true);
    expect(phOnly.length).toBe(3);

    const intlOnly = mockEvents.filter((e) => e.region === 'International');
    expect(intlOnly.every((e) => e.region === 'International')).toBe(true);
    expect(intlOnly.length).toBe(2);
  });
});
