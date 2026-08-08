import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t px-4 py-12">
      <div className="container mx-auto grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">HackForPinas</span>
          <p className="text-sm text-muted-foreground">
            Free Philippine hackathon directory
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Quick Links
          </h4>
          <nav className="flex flex-col gap-2">
            <Link
              href="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Submit Event
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Disclaimer
          </h4>
          <p className="text-sm text-muted-foreground">
            This is a community-driven directory. All event details, dates, and terms are subject to change by their respective organizers.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
        &copy; {currentYear} HackForPinas. All rights reserved.
      </div>
    </footer>
  );
}
