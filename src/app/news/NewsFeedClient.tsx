'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '@/lib/news';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface Props {
  articles: NewsItem[];
}

export default function NewsFeedClient({ articles }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'government' | 'media'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getSourceIcon = (source: string) => {
    switch (source.toUpperCase()) {
      case 'DOST ASTI':
      case 'DOST NATIONAL':
        return 'fluent:shield-keyhole-16-regular';
      case 'INQUIRER TECH':
        return 'fluent:megaphone-16-regular';
      default:
        return 'fluent:news-16-regular';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toUpperCase()) {
      case 'DOST ASTI':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'INQUIRER TECH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getSpineGlowColor = (source: string) => {
    switch (source.toUpperCase()) {
      case 'DOST ASTI':
        return 'bg-blue-500/40';
      case 'INQUIRER TECH':
        return 'bg-amber-500/40';
      default:
        return 'bg-primary/40';
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b bg-background/95 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon icon="fluent:document-bullet-list-16-regular" width={14} />
          {filteredArticles.length} updates found in the stream
        </div>
      </div>

      {/* ── Threads/Social Style News Stream ───────────────────── */}
      {filteredArticles.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          {filteredArticles.map((article, idx) => {
            const isGov = article.sourceCategory === 'government';
            const formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });
            
            // Calculate reading time based on 200 WPM
            const words = (article.title + ' ' + article.description).split(/\s+/).length;
            const readingTime = Math.max(1, Math.ceil(words / 200));

            const isCopied = copiedUrl === article.link;

            return (
              <motion.div
                key={`${article.link}-${idx}`}
                variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.25 }}
                className="group flex gap-4 w-full"
              >
                {/* Left Side: Avatar & Timeline Spine */}
                <div className="flex flex-col items-center shrink-0">
                  {/* Circle Avatar badge */}
                  <div className={cn(
                    'w-10 h-10 rounded-full border flex items-center justify-center bg-card transition-all duration-300 group-hover:scale-105',
                    isGov ? 'border-blue-500/20 text-blue-400' : 'border-amber-500/20 text-amber-400'
                  )}>
                    <Icon icon={getSourceIcon(article.sourceName)} width={20} />
                  </div>
                  
                  {/* Spine Connector track */}
                  {idx !== filteredArticles.length - 1 && (
                    <div className="w-0.5 bg-border/30 flex-1 my-2 transition-colors duration-300 group-hover:bg-border/60 relative">
                      {/* Subtly glowing neon hover spine overlay */}
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded',
                        getSpineGlowColor(article.sourceName)
                      )} />
                    </div>
                  )}
                </div>

                {/* Right Side: Post Contents */}
                <div className="flex-1 pb-10 flex flex-col gap-2">
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn(
                      'font-bold px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider',
                      getSourceBadgeColor(article.sourceName)
                    )}>
                      {article.sourceName}
                    </span>
                    {isGov && <VerifiedBadge />}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground font-medium" title={new Date(article.pubDate).toLocaleString()}>
                      {formattedDate}
                    </span>
                  </div>

                  {/* Headline */}
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base md:text-lg font-bold leading-snug text-foreground/95 hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {article.title}
                  </a>

                  {/* Description text */}
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
                    {article.description}
                  </p>

                  {/* Social Action Footer */}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {/* Read More button */}
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors py-1 min-h-[32px] font-medium"
                    >
                      <Icon icon="fluent:open-16-regular" width={14} />
                      Read post
                    </a>

                    {/* Copy / Share button */}
                    <button
                      onClick={() => handleCopy(article.link)}
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors py-1 min-h-[32px] cursor-pointer font-medium',
                        isCopied ? 'text-emerald-400' : 'hover:text-primary'
                      )}
                      aria-label="Share post"
                    >
                      <Icon icon={isCopied ? 'fluent:checkmark-16-filled' : 'fluent:share-android-16-regular'} width={14} />
                      {isCopied ? 'Copied' : 'Share'}
                    </button>

                    {/* Reading Time Badge */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted px-2 py-0.5 rounded border border-border/20">
                      <Icon icon="fluent:clock-16-regular" width={12} />
                      {readingTime} min read
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon icon="fluent:search-dismiss-24-regular" className="text-muted-foreground w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No updates found</h2>
          <p className="text-muted-foreground">Adjust your filters or query a different keyword.</p>
        </div>
      )}
    </div>
  );
}
