import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              <span className="text-primary">Hack</span>ForPinas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A free directory of Philippine hackathon and tech competition events.
            </p>
          </div>
          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Browse Events
            </Link>
            <Link
              to="/submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Submit an Event
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/70">
          HackForPinas aggregates publicly available event information. We are not affiliated with any organizer.
          Always verify event details at the original source before registering.
        </p>
      </div>
    </footer>
  )
}
