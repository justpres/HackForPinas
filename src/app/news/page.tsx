import { Metadata } from 'next';
import { fetchTechNews, NewsItem } from '@/lib/news';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import NewsFeedClient from './NewsFeedClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Philippine Tech & Hackathon News Feed | HackForPinas 🇵🇭',
  description: 'Stay updated with the latest announcements, startup news, and hackathon insights from DICT, DOST, and leading technology media portals in the Philippines.',
  openGraph: {
    title: 'Philippine Tech & Hackathon News Feed | HackForPinas',
    description: 'Stay updated with the latest announcements, startup news, and hackathon insights from DICT, DOST, and leading technology media portals in the Philippines.',
    url: 'https://hackforpinas.gg/news',
    type: 'website',
    locale: 'en_PH',
    siteName: 'HackForPinas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Philippine Tech & Hackathon News Feed | HackForPinas',
    description: 'Stay updated with the latest announcements, startup news, and hackathon insights from DICT, DOST, and leading technology media portals in the Philippines.',
  }
};

export default async function NewsPage() {
  let articles: NewsItem[] = [];
  try {
    articles = await fetchTechNews();
  } catch (err) {
    console.error('Error loading news feed:', err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main id="main-content" className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-primary via-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Philippine Tech News Feed
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Normalized, verified, and filtered RSS updates detailing software development, startup activities, and tech competitions across the country.
            </p>
          </header>
          
          <NewsFeedClient articles={articles} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
