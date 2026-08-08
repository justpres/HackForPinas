import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About HackForPinas | HackForPinas',
  description: 'Learn about HackForPinas — a free, public directory aggregating Philippine hackathon and tech competition events from government agencies, universities, and private organizers.',
  openGraph: {
    title: 'About HackForPinas',
    description: 'A free, public directory aggregating Philippine hackathon and tech competition events from government agencies, universities, and private organizers.',
    type: 'website',
    locale: 'en_PH',
    siteName: 'HackForPinas',
  },
  twitter: {
    card: 'summary',
    title: 'About HackForPinas',
    description: 'A free, public directory aggregating Philippine hackathon and tech competition events.',
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-10">About HackForPinas</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">What is HackForPinas</h2>
              <p>
                HackForPinas is a free, public, no-login directory of Philippine hackathons and tech competitions. 
                Our goal is to make it easier for developers, designers, and tech enthusiasts in the Philippines 
                to discover opportunities to build, learn, and showcase their skills.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How Events are Sourced</h2>
              <p>
                We aggregate events through multiple channels:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Community Submissions:</strong> Our primary source of events. Anyone can submit a hackathon.</li>
                <li><strong>Facebook Page Monitoring:</strong> We track active tech community pages and student organizations.</li>
                <li><strong>Official Sites:</strong> Monitoring of university and government portals for tech initiatives.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How to Contribute</h2>
              <p className="mb-4">
                If you are organizing an event or know of one that isn't listed here, we would love your contribution!
              </p>
              <Link href="/submit">
                <Button variant="outline">Submit an Event</Button>
              </Link>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Disclaimer</h2>
              <p>
                The event information listed on HackForPinas is sourced from third parties. 
                While we strive to keep the directory accurate and up-to-date, event details 
                (dates, venues, requirements) may change without our knowledge. 
                Always verify the information directly with the original event organizer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>
                Have questions or feedback? Reach out to us at 
                <a href="mailto:hello@hackforpinas.com" className="text-blue-600 hover:underline ml-1">hello@hackforpinas.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
