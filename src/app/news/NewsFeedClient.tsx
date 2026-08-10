'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '@/lib/news';
import { cn } from '@/lib/utils';
import { GenerativePattern } from '@/components/GenerativePattern';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface Props {
  articles: NewsItem[];
}

export default function NewsFeedClient({ articles }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'government' | 'media'>('all');

  const filteredArticles = articles.filter((item) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSource = item.sourceName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSource) return false;
    }

    // Category filter
    if (category !== 'all' && item.sourceCategory !== category) return false;

    return true;
  });

  const getSourceColorClass = (source: string) => {
    switch (source.toUpperCase()) {
      case 'DICT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DOST ASTI':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'INQUIRER TECH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border/20';
    }
  };

  const getCardGlowClass = (source: string) => {
    switch (source.toUpperCase()) {
      case 'DICT':
        return 'group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30';
      case 'DOST ASTI':
        return 'group-hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)] group-hover:border-blue-500/30';
      case 'INQUIRER TECH':
        return 'group-hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)] group-hover:border-amber-500/30';
      default:
        return 'group-hover:shadow-[0_0_15px_-3px_rgba(255,255,255,0.05)]';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b bg-background/95 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Icon
              icon="fluent:search-16-regular"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width={16}
            />
            <input
              type="text"
              placeholder="Search tech news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
              aria-label="Search tech news"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="News categories">
            {(['all', 'government', 'media'] as const).map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all duration-200 min-h-[38px] flex items-center justify-center',
                  category === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {cat === 'all' ? 'All Sources' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Count */}
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1.5">
          <Icon icon="fluent:document-bullet-list-16-regular" width={16} />
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* ── News Cards Grid ───────────────────────────────────── */}
      {filteredArticles.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredArticles.map((article, idx) => {
            const isGov = article.sourceCategory === 'government';
            const formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });

            return (
              <motion.article
                key={`${article.link}-${idx}`}
                variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.25 }}
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                className={cn(
                  'group flex flex-col overflow-hidden rounded-lg border bg-card/40 transition-all duration-300',
                  getCardGlowClass(article.sourceName)
                )}
                style={{ boxShadow: 'var(--shadow-resting)' }}
              >
                {/* Header Image Area */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                      loading="lazy"
                    />
                  ) : (
                    <GenerativePattern
                      seed={article.title}
                      organizerType={isGov ? 'government' : 'private'}
                      className="h-full w-full transition-transform duration-300 group-hover:scale-103"
                    />
                  )}

                  {/* Glassmorphic Date Overlay */}
                  <div className="absolute right-2 top-2 rounded-md bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm border border-white/5">
                    {formattedDate}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                  <div className="flex flex-col gap-2">
                    {/* Source Badges */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        getSourceColorClass(article.sourceName)
                      )}>
                        {article.sourceName}
                      </span>
                      {isGov && <VerifiedBadge />}
                    </div>

                    {/* Headline */}
                    <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    {/* Description Snippet */}
                    <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  {/* Outbound Link Button (WCAG Compliance) */}
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card/85 px-4 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary min-h-[44px] cursor-pointer mt-auto"
                  >
                    Read Full Article
                    <Icon icon="fluent:open-16-regular" width={14} />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon icon="fluent:search-dismiss-24-regular" className="text-muted-foreground w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No articles match your search</h2>
          <p className="text-muted-foreground">Adjust your filters or type a different keyword.</p>
        </div>
      )}
    </div>
  );
}
