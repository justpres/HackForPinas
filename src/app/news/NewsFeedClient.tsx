'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '@/lib/news';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface Props {
  articles: NewsItem[];
}

// Seed initial reaction counts based on the article's link string
const getInitialReactions = (link: string) => {
  let hash = 0;
  for (let i = 0; i < link.length; i++) {
    hash = link.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seedLike = Math.abs(hash % 24) + 2;
  const seedFire = Math.abs((hash >> 2) % 18) + 1;
  const seedRocket = Math.abs((hash >> 4) % 12);
  return { like: seedLike, fire: seedFire, rocket: seedRocket };
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

// Skeleton Loader Component
function NewsItemSkeleton() {
  return (
    <div className="flex gap-4 w-full animate-pulse p-2 select-none">
      {/* Left Side: Avatar & Timeline Spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-muted/80 border border-muted/20" />
        <div className="w-0.5 bg-muted/30 flex-1 my-2 min-h-[70px]" />
      </div>
      
      {/* Right Side: Contents */}
      <div className="flex-1 pb-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-muted/80 rounded w-20" />
          <span className="text-muted/40 text-xs">•</span>
          <div className="h-4 bg-muted/80 rounded w-24" />
        </div>
        <div className="h-6 bg-muted/80 rounded w-11/12" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/70 rounded w-full" />
          <div className="h-4 bg-muted/70 rounded w-4/5" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <div className="flex gap-2">
            <div className="h-7 bg-muted/60 rounded-full w-14" />
            <div className="h-7 bg-muted/60 rounded-full w-14" />
            <div className="h-7 bg-muted/60 rounded-full w-14" />
          </div>
          <div className="flex gap-3">
            <div className="h-6 bg-muted/60 rounded w-16" />
            <div className="h-6 bg-muted/60 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NewsItemCardProps {
  article: NewsItem;
  idx: number;
  isLast: boolean;
  isRead: boolean;
  onMarkAsRead: () => void;
  onShare: (url: string) => void;
  isCopied: boolean;
  reactionData: { like: number; fire: number; rocket: number; userReacted: Record<string, boolean> } | undefined;
  onReact: (type: 'like' | 'fire' | 'rocket') => void;
}

function NewsItemCard({
  article,
  idx,
  isLast,
  isRead,
  onMarkAsRead,
  onShare,
  isCopied,
  reactionData,
  onReact,
}: NewsItemCardProps) {
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!isRead && !hoverTimerRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        onMarkAsRead();
      }, 2000);
    }
  };

  const clearTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const isGov = article.sourceCategory === 'government';
  const formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });
  
  // Calculate reading time based on 200 WPM
  const words = (article.title + ' ' + article.description).split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.25 }}
      onMouseEnter={startTimer}
      onMouseLeave={clearTimer}
      onFocus={startTimer}
      onBlur={clearTimer}
      tabIndex={0}
      className={cn(
        "group flex gap-4 w-full transition-all duration-300 outline-none rounded-xl p-2 -mx-2 hover:bg-card/30 focus-visible:bg-card/30",
        isRead ? "opacity-60" : "opacity-100"
      )}
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
        {!isLast && (
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
          {isRead && (
            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.2 rounded font-semibold tracking-wide uppercase">
              Read
            </span>
          )}
        </div>

        {/* Headline */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onMarkAsRead}
          className="text-base md:text-lg font-bold leading-snug text-foreground/95 hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          {article.title}
        </a>

        {/* Description text */}
        <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
          {article.description}
        </p>

        {/* Social Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          {/* Micro reactions */}
          <div className="flex items-center gap-2 select-none">
            {(['like', 'fire', 'rocket'] as const).map((type) => {
              const count = reactionData ? reactionData[type] : 0;
              const hasReacted = reactionData ? !!reactionData.userReacted[type] : false;
              
              let emoji = '👍';
              let label = 'Like';
              let activeClass = 'text-blue-500 bg-blue-500/10 border-blue-500/30';
              let hoverClass = 'hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20';
              
              if (type === 'fire') {
                emoji = '🔥';
                label = 'Fire';
                activeClass = 'text-orange-500 bg-orange-500/10 border-orange-500/30';
                hoverClass = 'hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20';
              } else if (type === 'rocket') {
                emoji = '🚀';
                label = 'Rocket';
                activeClass = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30';
                hoverClass = 'hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20';
              }

              return (
                <motion.button
                  key={type}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => onReact(type)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 min-h-[28px] outline-none focus-visible:ring-1 focus-visible:ring-primary",
                    hasReacted 
                      ? activeClass 
                      : "bg-muted/40 text-muted-foreground border-border/40 " + hoverClass
                  )}
                  aria-label={`React with ${label}`}
                >
                  <motion.span
                    key={hasReacted ? `${type}-active` : `${type}-inactive`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 12 }}
                    className="inline-block"
                  >
                    {emoji}
                  </motion.span>
                  <span className="font-mono text-[11px]">{count}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Social / Info buttons */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {/* Read More button */}
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onMarkAsRead}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors py-1 min-h-[32px] font-medium"
            >
              <Icon icon="fluent:open-16-regular" width={14} />
              Read post
            </a>

            {/* Copy / Share button */}
            <button
              onClick={() => {
                onShare(article.link);
                onMarkAsRead();
              }}
              className={cn(
                'inline-flex items-center gap-1 transition-colors py-1 min-h-[32px] cursor-pointer font-medium border-0 bg-transparent',
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
      </div>
    </motion.div>
  );
}

export default function NewsFeedClient({ articles }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'government' | 'media'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Infinite Scroll States
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Engagement Hooks (Read Status & Reactions)
  const [readLinks, setReadLinks] = useState<string[]>([]);
  const [reactions, setReactions] = useState<Record<string, { like: number; fire: number; rocket: number; userReacted: Record<string, boolean> }>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Hydrate read links from localStorage safely
    const storedRead = localStorage.getItem('read-news-links-v1');
    if (storedRead) {
      try {
        setReadLinks(JSON.parse(storedRead));
      } catch (e) {
        console.error(e);
      }
    }

    // Hydrate reaction states from localStorage safely
    const storedReactions = localStorage.getItem('news-reactions-v1');
    let parsed: Record<string, { like: number; fire: number; rocket: number; userReacted: Record<string, boolean> }> = {};
    if (storedReactions) {
      try {
        parsed = JSON.parse(storedReactions);
      } catch (e) {
        console.error(e);
      }
    }

    // Initialize state with stored reactions merged with seeded default values
    const initial: typeof reactions = {};
    articles.forEach((art) => {
      const seed = getInitialReactions(art.link);
      const userStored = parsed[art.link] || { like: seed.like, fire: seed.fire, rocket: seed.rocket, userReacted: {} };
      if (!userStored.userReacted) {
        userStored.userReacted = {};
      }
      initial[art.link] = userStored;
    });
    setReactions(initial);
  }, [articles]);

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

  // Reset pagination when search query or filters change
  useEffect(() => {
    setVisibleCount(8);
    setLoadingMore(false);
  }, [search, category]);

  // Setup IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    if (loadingMore || visibleCount >= filteredArticles.length) return;

    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 8, filteredArticles.length));
            setLoadingMore(false);
          }, 600); // Simulated delay for visual skeleton appeal
        }
      },
      {
        rootMargin: '100px',
      }
    );

    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [filteredArticles.length, loadingMore, visibleCount]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const markAsRead = (link: string) => {
    setReadLinks((prev) => {
      if (prev.includes(link)) return prev;
      const updated = [...prev, link];
      localStorage.setItem('read-news-links-v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReact = (link: string, type: 'like' | 'fire' | 'rocket') => {
    setReactions((prev) => {
      const current = prev[link] || { ...getInitialReactions(link), userReacted: {} };
      const reacted = !!current.userReacted[type];
      
      const newCount = reacted ? current[type] - 1 : current[type] + 1;
      const newReacted = { ...current.userReacted, [type]: !reacted };
      
      const updated = {
        ...prev,
        [link]: {
          ...current,
          [type]: newCount,
          userReacted: newReacted,
        },
      };
      
      localStorage.setItem('news-reactions-v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Reading Progress computations
  const totalArticlesCount = filteredArticles.length;
  const readArticlesCount = isMounted 
    ? filteredArticles.filter(item => readLinks.includes(item.link)).length
    : 0;
  const progressPercentage = totalArticlesCount > 0 ? (readArticlesCount / totalArticlesCount) * 100 : 0;

  const visibleArticles = filteredArticles.slice(0, visibleCount);

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
      {/* ── Sticky Progress Bar & Filter Bar ───────────────────── */}
      <div className="sticky top-16 z-30 border-b bg-background/95 py-4 backdrop-blur-sm flex flex-col gap-4">
        {/* Reading Progress Card */}
        <div className="flex flex-col gap-2 w-full bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          {/* Neon background pulse */}
          <div className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="flex items-center justify-between text-xs font-semibold relative z-10">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Icon icon="fluent:book-read-20-regular" width={16} className="text-primary" />
              Reading Stream Progress
            </span>
            <span className="text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              Read {readArticlesCount} / {totalArticlesCount} updates
            </span>
          </div>

          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden relative z-10">
            <motion.div 
              className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            />
          </div>
        </div>

        {/* Filter and Search Bar */}
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
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon icon="fluent:document-bullet-list-16-regular" width={14} />
          {filteredArticles.length} updates found in the stream
        </div>
      </div>

      {/* ── Threads/Social Style News Stream ───────────────────── */}
      {visibleArticles.length > 0 ? (
        <div className="flex flex-col">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {visibleArticles.map((article, idx) => {
              const isLastCard = idx === visibleArticles.length - 1 && !loadingMore;
              
              return (
                <NewsItemCard
                  key={`${article.link}-${idx}`}
                  article={article}
                  idx={idx}
                  isLast={isLastCard}
                  isRead={readLinks.includes(article.link)}
                  onMarkAsRead={() => markAsRead(article.link)}
                  onShare={handleCopy}
                  isCopied={copiedUrl === article.link}
                  reactionData={reactions[article.link]}
                  onReact={(type) => handleReact(article.link, type)}
                />
              );
            })}
          </motion.div>

          {/* Render Skeletons during lazy loading */}
          {loadingMore && (
            <div className="flex flex-col gap-4 mt-4">
              <NewsItemSkeleton />
              <NewsItemSkeleton />
            </div>
          )}

          {/* Sentinel intersection observer target */}
          {visibleCount < filteredArticles.length && (
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center my-4">
              {!loadingMore && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Scroll for more...
                </span>
              )}
            </div>
          )}
        </div>
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
