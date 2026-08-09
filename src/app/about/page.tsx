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
  const faqs = [
    {
      question: 'What is HackForPinas?',
      answer: 'HackForPinas is a free, public, and open-source directory that aggregates Philippine hackathons, coding challenges, and tech competitions from government agencies, universities, and private organizers. Our goal is to make it easy for developers, designers, and tech enthusiasts across the country to discover opportunities to build, learn, and showcase their skills.',
    },
    {
      question: 'How do I submit a hackathon to HackForPinas?',
      answer: 'Anyone can submit an event! Click the "Submit an Event" button, fill in the required event details (such as title, organizer, deadline, region, and format), and submit it. Our administrators will review the submission and publish it to the directory once verified.',
    },
    {
      question: 'Are the events on HackForPinas verified?',
      answer: 'Yes. To maintain high-quality listings and prevent spam, all community-submitted events undergo an administrative audit. We verify the organizer credentials, official website links, and contact channels before marking an event as published.',
    },
    {
      question: 'Is HackForPinas free to use?',
      answer: 'Yes, HackForPinas is completely free, public, and open-source. There is no user registration or login required to search, filter, or explore the hackathon listings.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-10">About HackForPinas</h1>
          
          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">What is HackForPinas</h2>
              <p>
                HackForPinas is a free, public, no-login directory of Philippine hackathons and tech competitions. 
                Our goal is to make it easier for developers, designers, and tech enthusiasts in the Philippines 
                to discover opportunities to build, learn, and showcase their skills. We aim to support the local
                developer ecosystem by compiling scattered opportunities into one central repository.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How Events are Sourced</h2>
              <p>
                We aggregate events through multiple channels to provide a comprehensive listing:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Community Submissions:</strong> Our primary source of events. Anyone can submit a hackathon.</li>
                <li><strong>Facebook Page Monitoring:</strong> We track active tech community pages and student organizations.</li>
                <li><strong>Official Sites:</strong> Monitoring of university and government portals for tech initiatives.</li>
              </ul>
            </section>

            {/* AEO Conversational FAQ Section */}
            <section aria-label="Frequently Asked Questions" className="border-t border-border/10 pt-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group border border-border/10 rounded-lg bg-card/30 p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-foreground font-medium">
                      <span className="text-base font-semibold">{faq.question}</span>
                      <span className="shrink-0 rounded-full bg-muted p-1 text-muted-foreground transition duration-300 group-open:-rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="border-t border-border/10 pt-8">
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

