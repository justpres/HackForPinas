# HackForPinas 🇵🇭

**HackForPinas** is a free, public, and open-source directory that aggregates Philippine hackathons, coding challenges, and tech competitions from government agencies, universities, and private organizers. The platform is designed to make it easy for developers, designers, and tech enthusiasts across the country to discover opportunities to build, learn, and showcase their skills.

---

## 🚀 Key Features

- **Dynamic Event Aggregator**: A clean, modern portal showcasing upcoming and past hackathons with automatic status updates.
- **Advanced Filtering & Sorting**: Filter events by Philippine region (NCR, Calabarzon, Visayas, etc.), event format (Online, In-Person, Hybrid), and organizer type (Government, University, Private).
- **Interactive UI & Visual Effects**: Built using cutting-edge design trends featuring:
  - **Generative Background**: An interactive vector SVG mesh background (`GenerativePattern`).
  - **Split-Flap Text**: Retro analog split-flap animations for stats and countdowns (`SplitFlapText`).
  - **Letter Glitch Effect**: Cyberpunk-style glitch text effects (`LetterGlitch`).
  - **CountUp Stats**: Interactive dynamic counters detailing active events, registered organizers, and covered regions.
- **Community Submissions**: A secure portal for organizers or participants to submit new hackathons with:
  - Robust schema validation powered by **Zod**.
  - Open-redirect protection via a custom validator protecting users from malicious external link redirects.
  - Inbuilt API rate-limiting to prevent spam.
- **Automated Content Scraper**: Cron-based background scraper (`/api/scrape`) configured to parse and ingest events from various Philippine technology hubs using multiple strategies (WordPress REST API, RSS feeds, GDG Community API, Eventbrite, and custom HTML scraping via Cheerio).
- **Secure Admin Panel & Audit Trail**: A review dashboard (`/admin`) for administrators to verify organizer details, edit entries, and approve/publish/reject submissions. The system tracks all actions with an audit log stored directly in the database.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS for premium visuals (Dark Mode by default)
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres, RLS Policies, Server-Side Rendering helper `@supabase/ssr`)
- **Animation**: [Motion](https://motion.dev/) (Framer Motion) & [Base UI](https://base-ui.com/)
- **Scraping**: [Cheerio](https://cheerio.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/) & [Iconify](https://iconify.design/)
- **Validation**: [Zod](https://zod.dev/)
- **Date Formatting**: [Date-fns](https://date-fns.org/)

---

## 📁 Repository Structure

```text
├── src/
│   ├── app/                      # Next.js App Router Pages & API Routes
│   │   ├── about/                # About Page
│   │   ├── admin/                # Admin Panel (Login, Submissions Review)
│   │   ├── api/                  # API Endpoints (Scraper, Submissions Handler)
│   │   ├── events/               # Event details page routing
│   │   ├── submit/               # Community Event Submission Page
│   │   ├── globals.css           # Global Stylesheets (Tailwind CSS v4 imports)
│   │   └── HomepageClient.tsx    # Interactive home page client-side logic
│   ├── components/               # Reusable UI & Layout Components
│   │   ├── admin/                # Admin-specific components
│   │   ├── ui/                   # Basic UI components (Buttons, Inputs, Dialogs)
│   │   ├── SplitFlapText.tsx     # Retro analog display component
│   │   ├── LetterGlitch.tsx      # Cyberpunk glitch text effect
│   │   └── GenerativePattern.tsx # Interactive background vector mesh
│   ├── lib/                      # Core utility functions & configurations
│   │   ├── supabase/             # Supabase clients (Client, Server, Admin)
│   │   ├── constants.ts          # PH Regions, Formats, and Schema Constants
│   │   ├── scraper.ts            # Web scraping implementation and strategies
│   │   ├── rate-limit.ts         # In-memory rate limiting utility
│   │   ├── sanitize.ts           # HTML sanitization helper
│   │   └── redirect-validator.ts # Open-redirect prevention logic
│   └── scripts/                  # CLI scripts for DB seeding and debugging
└── supabase/                     # Supabase migrations and database setup files
    └── migrations/               # Local Postgres migration files
```

---

## 💾 Database Schema

The Postgres database structure includes three main tables:
1. **`organizers`**: Tracks event hosts, categorizing them into `government`, `university`, or `private` with verification status.
2. **`hackathons`**: Stores the event listing information (title, format, region, deadline, poster image URL, source details) and tracks its status (`pending_review`, `published`, `rejected`, `expired`).
3. **`submissions_audit_log`**: Tracks the workflow of submissions (who approved/rejected/edited an event and when) for transparency.

All tables are secured with **Row Level Security (RLS)**, and insert triggers enforce that all community submissions default to `pending_review` until verified by an admin.

---

## ⚙️ Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A [Supabase](https://supabase.com/) project (local instance or cloud database)

### 1. Clone the Project
```bash
git clone https://github.com/JustPres/HackForPinas.git
cd HackForPinas
```

### 2. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory based on the template:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: CRON_SECRET for securing background scraping endpoints
CRON_SECRET=local_development_secret
```

### 3. Setup Database Schema
Execute the SQL scripts found in the `supabase/migrations/` directory against your Supabase database in order:
1. `001_initial_schema.sql` (Creates tables, triggers, and indices)
2. `002_rls_policies.sql` (Applies RLS settings)
3. `003_seed_data.sql` (Seeds initial core organizers and upcoming sample hackathons)
4. `004_remove_admin_enforcement.sql` (Optimizes admin roles)
5. `005_allow_anon_inserts.sql` (Allows public community submissions)

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ CLI Utility Scripts

The project includes handy TypeScript scripts inside the `src/scripts/` directory for seeding, testing, and debugging. You can run them using `npx tsx`:

* **Verify Database Connection**:
  ```bash
  npx tsx src/scripts/check-db.ts
  ```
* **Seed Past Hackathons**:
  Seeds a diverse historical record of completed Philippine hackathons to demonstrate formatting and archiving.
  ```bash
  npx tsx src/scripts/seed-past-hackathons.ts
  ```
* **Publish All Pending Review Events**:
  Force-publishes all pending submissions directly to the dashboard (helpful for local testing).
  ```bash
  npx tsx src/scripts/publish-all.ts
  ```

---

## 🕸️ Background Web Scraper Pipeline

The aggregator is designed to run automatically. By visiting or triggering:
```http
GET /api/scrape?key=local_development_secret
```
The application runs dynamic scraper strategies concurrently:
1. **WordPress REST API (`wp_api`)**: Queries posts from gov/edu domains (e.g. PIA, DOST) for hackathon keywords.
2. **RSS Feeds (`rss`)**: Parses XML feeds from government sites (DICT, DOST) matching tech/coding topics.
3. **GDG Community (`gdg`)**: Integrates with the GDG Community portal APIs.
4. **HTML Scraper (`html`)**: Extracts elements via Cheerio from specific event directories (hackathons.ph, devcon.ph, etc.).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make to **HackForPinas** are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information (if applicable).
