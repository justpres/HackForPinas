import { HackathonWithOrganizer } from './types';

// Helper to get relative dates from now
const relativeDate = (daysOffset: number, hoursOffset: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
};

export const MOCK_HACKATHONS: HackathonWithOrganizer[] = [
  {
    id: 'mock-1',
    title: 'GovTech Philippines Hackathon 2026',
    organizer_id: 'org-dict',
    description: 'Develop cutting-edge digital solutions to improve government service delivery, e-governance systems, and transparency for local communities in the Philippines.',
    source_type: 'official_site',
    source_url: 'https://dict.gov.ph/govtech-2026',
    redirect_url: 'https://dict.gov.ph/govtech-2026',
    deadline: relativeDate(6), // Amber (3-7 days)
    event_start: relativeDate(8),
    event_end: relativeDate(10),
    region: 'NCR',
    format: 'hybrid',
    status: 'published',
    poster_image_url: null,
    last_checked_at: new Date().toISOString(),
    submitted_by_email: null,
    created_at: new Date().toISOString(),
    organizer: {
      id: 'org-dict',
      name: 'DICT (Department of Information and Communications Technology)',
      organizer_type: 'government',
      is_verified: true,
      facebook_page_id: 'DICTgovph',
      official_website: 'https://dict.gov.ph',
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'mock-2',
    title: 'NASA Space Apps Challenge - Manila',
    organizer_id: 'org-dost',
    description: 'An international hackathon for coders, scientists, designers, storytellers, makers, builders, and technologists to address real-world problems using NASA\'s open data.',
    source_type: 'official_site',
    source_url: 'https://dost.gov.ph/spaceapps',
    redirect_url: 'https://dost.gov.ph/spaceapps',
    deadline: relativeDate(1, 12), // Urgent (under 48 hours)
    event_start: relativeDate(3),
    event_end: relativeDate(5),
    region: 'Nationwide',
    format: 'online',
    status: 'published',
    poster_image_url: null,
    last_checked_at: new Date().toISOString(),
    submitted_by_email: null,
    created_at: new Date().toISOString(),
    organizer: {
      id: 'org-dost',
      name: 'DOST (Department of Science and Technology)',
      organizer_type: 'government',
      is_verified: true,
      facebook_page_id: 'DOSTph',
      official_website: 'https://dost.gov.ph',
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'mock-3',
    title: 'UP CS CodeStorm 2026',
    organizer_id: 'org-upcs',
    description: 'The annual student-led coding tournament designed to test algorithmic logic, speed-coding, and team strategy among top universities in the country.',
    source_type: 'official_site',
    source_url: 'https://dcs.upd.edu.ph/codestorm',
    redirect_url: 'https://dcs.upd.edu.ph/codestorm',
    deadline: relativeDate(12), // Neutral (7+ days)
    event_start: relativeDate(14),
    event_end: relativeDate(15),
    region: 'NCR',
    format: 'in-person',
    status: 'published',
    poster_image_url: null,
    last_checked_at: new Date().toISOString(),
    submitted_by_email: null,
    created_at: new Date().toISOString(),
    organizer: {
      id: 'org-upcs',
      name: 'UP Diliman Computer Science Association',
      organizer_type: 'university',
      is_verified: true,
      facebook_page_id: 'updcs',
      official_website: 'https://dcs.upd.edu.ph',
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'mock-4',
    title: 'Smart Communications Hacka-Pinoy',
    organizer_id: 'org-smart',
    description: 'Build innovative mobile and web solutions leveraging 5G connectivity, IoT sensors, and cloud services to enhance disaster response and resilience in regional municipalities.',
    source_type: 'facebook',
    source_url: 'https://facebook.com/SmartCommunications',
    redirect_url: 'https://smart.com.ph/hackathon',
    deadline: relativeDate(25), // Neutral (7+ days)
    event_start: relativeDate(28),
    event_end: relativeDate(30),
    region: 'Region VII',
    format: 'hybrid',
    status: 'published',
    poster_image_url: null,
    last_checked_at: new Date().toISOString(),
    submitted_by_email: null,
    created_at: new Date().toISOString(),
    organizer: {
      id: 'org-smart',
      name: 'Smart Communications, Inc.',
      organizer_type: 'private',
      is_verified: true,
      facebook_page_id: 'smartcommunications',
      official_website: 'https://smart.com.ph',
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'mock-5',
    title: 'StartUp Weekend Davao 2026',
    organizer_id: 'org-davao',
    description: 'Form teams, pitch business models, build functional prototypes, and present to veteran judges all in 54 hours in the heart of Davao City.',
    source_type: 'community_submitted',
    source_url: 'https://facebook.com/swdavao',
    redirect_url: 'https://startupweekend.org/davao',
    deadline: relativeDate(4), // Amber (3-7 days)
    event_start: relativeDate(5),
    event_end: relativeDate(7),
    region: 'Region XI',
    format: 'in-person',
    status: 'published',
    poster_image_url: null,
    last_checked_at: new Date().toISOString(),
    submitted_by_email: null,
    created_at: new Date().toISOString(),
    organizer: {
      id: 'org-davao',
      name: 'Davao Tech Community Builders',
      organizer_type: 'private',
      is_verified: false,
      facebook_page_id: null,
      official_website: 'https://swdavao.org',
      created_at: new Date().toISOString()
    }
  }
];
