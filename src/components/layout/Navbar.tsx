import { Icon } from "@iconify/react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Events", href: "/" },
  { label: "Submit", href: "/submit" },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[6px]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary">
            <Icon icon="fluent:code-block-16-filled" width={16} className="text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-base font-700 tracking-tight text-foreground">
            <span className="text-primary font-bold">Hack</span>
            <span className="font-semibold">ForPinas</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
