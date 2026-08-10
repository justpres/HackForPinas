import { Metadata } from 'next';
import { fetchTechNews, NewsItem } from '@/lib/news';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import NewsFeedClient from './NewsFeedClient';
import GradientText from '@/components/GradientText';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ link?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const linkParam = resolvedSearchParams.link;

  if (linkParam) {
    try {
      const articles = await fetchTechNews();
      const match = articles.find((a) => a.link === linkParam);
      if (match) {
        return {
          title: `${match.title} | HackForPinas Tech Stream 🇵🇭`,
          description: match.description,
          openGraph: {
            title: match.title,
            description: match.description,
            images: match.imageUrl ? [{ url: match.imageUrl }] : undefined,
            url: `https://hackforpinas.gg/news?link=${encodeURIComponent(linkParam)}`,
            type: 'article',
            locale: 'en_PH',
            siteName: 'HackForPinas',
          },
          twitter: {
            card: 'summary_large_image',
            title: match.title,
            description: match.description,
            images: match.imageUrl ? [match.imageUrl] : undefined,
          }
        };
      }
    } catch (e) {
      console.error('Error generating dynamic OG metadata:', e);
    }
  }

  // Fallback default metadata
  return {
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
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const linkParam = resolvedSearchParams.link;

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
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl flex justify-center md:justify-start">
              <GradientText
                colors={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
                animationSpeed={8}
                showBorder={false}
                className="font-extrabold"
              >
                Philippine Tech News Feed
              </GradientText>
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Normalized, verified, and filtered RSS updates detailing software development, startup activities, and tech competitions across the country.
            </p>
          </header>
          
          <NewsFeedClient articles={articles} initialLink={linkParam} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
