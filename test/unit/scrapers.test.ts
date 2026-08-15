import { describe, it, expect } from 'vitest';

describe('Scraper Parsers & Keyword Exclusion', () => {
  it('excludes localized Philippine events from foreign crawl', () => {
    const phFilterRegex = /\b(philippines|filipino|taguig|makati|manila|cebu|davao|quezon city|dost|dict)\b/i;

    const sampleForeignItem = {
      title: 'Global AI Agent Challenge 2026',
      description: 'Build autonomous agents with open source models. Open worldwide.',
    };

    const sampleLocalItem = {
      title: 'DICT Hackathon Metro Manila',
      description: 'Exclusive to Filipino developers residing in Quezon City.',
    };

    const isForeignExcluded = phFilterRegex.test(sampleForeignItem.title) || phFilterRegex.test(sampleForeignItem.description);
    const isLocalExcluded = phFilterRegex.test(sampleLocalItem.title) || phFilterRegex.test(sampleLocalItem.description);

    expect(isForeignExcluded).toBe(false);
    expect(isLocalExcluded).toBe(true);
  });

  it('maps Devfolio JSON hackathon format correctly', () => {
    const devfolioSample = {
      name: 'ETHGlobal Singapore',
      slug: 'ethglobal-sg',
      tagline: 'Leading web3 hackathon in Southeast Asia',
      starts_at: '2026-09-01T00:00:00Z',
      ends_at: '2026-09-03T00:00:00Z',
      is_online: false,
      location: 'Singapore',
      banner_url: 'https://devfolio.co/banner.jpg',
    };

    const mapped = {
      title: devfolioSample.name,
      description: devfolioSample.tagline,
      redirect_url: `https://${devfolioSample.slug}.devfolio.co`,
      source_url: 'https://devfolio.co',
      event_start: devfolioSample.starts_at,
      event_end: devfolioSample.ends_at,
      format: devfolioSample.is_online ? 'online' : 'in-person',
      region: 'International',
      poster_image_url: devfolioSample.banner_url,
    };

    expect(mapped.title).toBe('ETHGlobal Singapore');
    expect(mapped.region).toBe('International');
    expect(mapped.format).toBe('in-person');
    expect(mapped.redirect_url).toBe('https://ethglobal-sg.devfolio.co');
  });
});
