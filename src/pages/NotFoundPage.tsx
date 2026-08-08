import { Link } from "react-router-dom"
import { Icon } from "@iconify/react"
import { motion } from "motion/react"

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-muted mb-4">
        <Icon icon="fluent:document-dismiss-16-regular" width={24} className="text-muted-foreground" aria-label="Page not found" />
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">404</p>
      <h1 className="text-[24px] font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        The page you are looking for does not exist or may have been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon icon="fluent:arrow-left-16-regular" width={16} aria-hidden="true" />
        Back to Events
      </Link>
    </motion.div>
  )
}
