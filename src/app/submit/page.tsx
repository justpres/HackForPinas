import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SubmissionForm } from '@/components/SubmissionForm';

export const metadata: Metadata = {
  title: 'Submit an Event | HackForPinas',
};

export default function SubmitPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">Submit an Event</h1>
          <p className="text-center text-muted-foreground mb-10 leading-relaxed">
            Know about a hackathon or tech competition in the Philippines? 
            Submit it here and help the community discover it. 
            All submissions are reviewed before publishing.
          </p>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <SubmissionForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
