-- Disable trigger temporarily to allow inserting published status directly
alter table hackathons disable trigger trg_enforce_pending_review;

-- Seed Organizers
insert into organizers (id, name, organizer_type, is_verified, official_website, facebook_page_id) values
  ('d17d5402-6014-41d3-a3d8-508b9195b051', 'DICT (Department of Information and Communications Technology)', 'government', true, 'https://dict.gov.ph', 'DICTgovph'),
  ('d17d5402-6014-41d3-a3d8-508b9195b052', 'DOST (Department of Science and Technology)', 'government', true, 'https://dost.gov.ph', 'DOSTph'),
  ('d17d5402-6014-41d3-a3d8-508b9195b053', 'UP Diliman Computer Science', 'university', true, 'https://dcs.upd.edu.ph', 'updcs'),
  ('d17d5402-6014-41d3-a3d8-508b9195b054', 'Ateneo Innovation Center', 'university', true, 'https://ateneo.edu', 'AteneoInnovation'),
  ('d17d5402-6014-41d3-a3d8-508b9195b055', 'Globe Telecom', 'private', true, 'https://globe.com.ph', 'globeph'),
  ('d17d5402-6014-41d3-a3d8-508b9195b056', 'Startup Weekend Manila', 'private', false, 'https://startupweekend.org', 'swmanila');

-- Seed Hackathons
insert into hackathons (id, title, organizer_id, description, source_type, source_url, redirect_url, deadline, event_start, event_end, region, format, status) values
  ('e17d5402-6014-41d3-a3d8-508b9195b061', 'GovTech Innovation Challenge 2026', 'd17d5402-6014-41d3-a3d8-508b9195b051', 'A national hackathon focused on modernizing government services through digital solutions. Participants will build tools to improve public service delivery and citizen engagement.', 'official_site', 'https://dict.gov.ph/govtech2026', 'https://dict.gov.ph/govtech2026/register', now() + interval '12 days', now() + interval '14 days', now() + interval '16 days', 'NCR', 'hybrid', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b062', 'Philippine Space Apps Challenge 2026', 'd17d5402-6014-41d3-a3d8-508b9195b052', 'Join the largest annual space and science hackathon in the country. Develop open-source solutions to address global challenges using satellite data.', 'official_site', 'https://dost.gov.ph/spaceapps', 'https://spaceapps.dost.gov.ph', now() + interval '5 days', now() + interval '7 days', now() + interval '9 days', 'Nationwide', 'online', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b063', 'UP CodeSprint 2026', 'd17d5402-6014-41d3-a3d8-508b9195b053', 'The premier inter-collegiate programming competition in the Philippines. Test your algorithmic problem-solving skills against the best student coders.', 'official_site', 'https://dcs.upd.edu.ph/codesprint', 'https://codesprint.upd.edu.ph/register', now() + interval '2 days', now() + interval '5 days', now() + interval '5 days', 'NCR', 'in-person', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b064', 'Ateneo Blue Hacks 2026', 'd17d5402-6014-41d3-a3d8-508b9195b054', 'An overnight hackathon bringing together students to solve pressing environmental and social issues. Build sustainable technology solutions for a better tomorrow.', 'official_site', 'https://facebook.com/bluehacks', 'https://ateneo.edu/bluehacks', now() + interval '20 days', now() + interval '25 days', now() + interval '26 days', 'NCR', 'hybrid', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b065', 'Globe GCreative Hackathon', 'd17d5402-6014-41d3-a3d8-508b9195b055', 'Unleash your creativity in this weekend-long event focused on 5G and IoT applications. Create innovative mobile experiences that connect communities.', 'official_site', 'https://globe.com.ph/gcreative', 'https://globe.com.ph/hackathon/register', now() + interval '1 day', now() + interval '3 days', now() + interval '4 days', 'Region IV-A', 'in-person', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b066', 'Startup Weekend Cebu', 'd17d5402-6014-41d3-a3d8-508b9195b056', 'Pitch ideas, form teams, and launch a startup in 54 hours. A collaborative event for developers, designers, and business enthusiasts in Central Visayas.', 'official_site', 'https://facebook.com/swcebu', 'https://swcebu.com/tickets', now() + interval '15 days', now() + interval '20 days', now() + interval '22 days', 'Region VII', 'in-person', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b067', 'Bangsamoro Digital Innovation Challenge', 'd17d5402-6014-41d3-a3d8-508b9195b051', 'Empowering the youth of BARMM to create localized digital solutions. Focus areas include agriculture, education, and peace-building technologies.', 'official_site', 'https://dict.gov.ph/barmm-challenge', 'https://dict.gov.ph/barmm-challenge/join', now() + interval '8 days', now() + interval '10 days', now() + interval '12 days', 'BARMM', 'hybrid', 'published'),
  ('e17d5402-6014-41d3-a3d8-508b9195b068', 'DOST Smart City Hackathon', 'd17d5402-6014-41d3-a3d8-508b9195b052', 'Design the future of urban living in Central Luzon. Develop smart city infrastructure, transportation, and energy solutions using open government data.', 'official_site', 'https://facebook.com/DOSTRegion3', 'https://smartcity.dost.gov.ph', now() + interval '30 days', now() + interval '40 days', now() + interval '42 days', 'Region III', 'online', 'published');

-- Re-enable trigger
alter table hackathons enable trigger trg_enforce_pending_review;

-- Seed Submissions Audit Log
insert into submissions_audit_log (hackathon_id, action, actor, notes) values
  ('e17d5402-6014-41d3-a3d8-508b9195b061', 'approved', 'admin@hackforpinas.com', 'Approved GovTech Innovation Challenge'),
  ('e17d5402-6014-41d3-a3d8-508b9195b062', 'approved', 'admin@hackforpinas.com', 'Approved Space Apps Challenge'),
  ('e17d5402-6014-41d3-a3d8-508b9195b063', 'approved', 'admin@hackforpinas.com', 'Approved UP CodeSprint'),
  ('e17d5402-6014-41d3-a3d8-508b9195b064', 'approved', 'admin@hackforpinas.com', 'Approved Blue Hacks'),
  ('e17d5402-6014-41d3-a3d8-508b9195b065', 'approved', 'admin@hackforpinas.com', 'Approved Globe GCreative'),
  ('e17d5402-6014-41d3-a3d8-508b9195b066', 'approved', 'admin@hackforpinas.com', 'Approved Startup Weekend Cebu'),
  ('e17d5402-6014-41d3-a3d8-508b9195b067', 'approved', 'admin@hackforpinas.com', 'Approved Bangsamoro Innovation Challenge'),
  ('e17d5402-6014-41d3-a3d8-508b9195b068', 'approved', 'admin@hackforpinas.com', 'Approved Smart City Hackathon');
