'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '@/lib/news';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface Props {
  articles: NewsItem[];
  initialLink?: string;
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
            <div className="h-7 bg-muted/60 rounded-full w-24" />
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
  onShare: (title: string, url: string) => void;
  isCopied: boolean;
  reactionData: { like: number; fire: number; rocket: number; userReacted: Record<string, boolean> } | undefined;
  onReact: (type: 'like' | 'fire' | 'rocket') => void;
  isHighlighted: boolean;
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
  isHighlighted
}: NewsItemCardProps) {
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trayEnterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trayLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  const [showTray, setShowTray] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Close share menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showShareMenu]);

  // Auto mark as read on hover/focus after 2s
  const startReadTimer = () => {
    if (!isRead && !hoverTimerRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        onMarkAsRead();
      }, 2000);
    }
  };

  const clearReadTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Hover triggers for the Facebook-style Reaction Tray (500ms enter delay, 200ms leave delay)
  const handleTriggerMouseEnter = () => {
    if (trayLeaveTimerRef.current) {
      clearTimeout(trayLeaveTimerRef.current);
      trayLeaveTimerRef.current = null;
    }
    if (!showTray && !trayEnterTimerRef.current) {
      trayEnterTimerRef.current = setTimeout(() => {
        setShowTray(true);
      }, 500); // 500ms delay to open
    }
  };

  const handleTriggerMouseLeave = () => {
    if (trayEnterTimerRef.current) {
      clearTimeout(trayEnterTimerRef.current);
      trayEnterTimerRef.current = null;
    }
    if (showTray && !trayLeaveTimerRef.current) {
      trayLeaveTimerRef.current = setTimeout(() => {
        setShowTray(false);
      }, 200); // 200ms delay to close
    }
  };

  const handleTrayMouseEnter = () => {
    if (trayLeaveTimerRef.current) {
      clearTimeout(trayLeaveTimerRef.current);
      trayLeaveTimerRef.current = null;
    }
  };

  const handleTrayMouseLeave = () => {
    if (showTray && !trayLeaveTimerRef.current) {
      trayLeaveTimerRef.current = setTimeout(() => {
        setShowTray(false);
      }, 200);
    }
  };

  const selectReaction = (type: 'like' | 'fire' | 'rocket') => {
    onReact(type);
    setShowTray(false);
    onMarkAsRead();
    if (trayEnterTimerRef.current) clearTimeout(trayEnterTimerRef.current);
    if (trayLeaveTimerRef.current) clearTimeout(trayLeaveTimerRef.current);
  };

  const handleDirectClick = () => {
    const currentActive = getActiveReaction();
    if (currentActive) {
      onReact(currentActive);
    } else {
      onReact('like');
    }
    onMarkAsRead();
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (trayEnterTimerRef.current) clearTimeout(trayEnterTimerRef.current);
      if (trayLeaveTimerRef.current) clearTimeout(trayLeaveTimerRef.current);
    };
  }, []);

  const isGov = article.sourceCategory === 'government';
  const formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });
  
  // Calculate reading time based on 200 WPM
  const words = (article.title + ' ' + article.description).split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Determine current active reaction type for trigger button
  const getActiveReaction = (): 'like' | 'fire' | 'rocket' | null => {
    if (!reactionData?.userReacted) return null;
    if (reactionData.userReacted.like) return 'like';
    if (reactionData.userReacted.fire) return 'fire';
    if (reactionData.userReacted.rocket) return 'rocket';
    return null;
  };

  const activeReaction = getActiveReaction();

  const getTriggerStyles = () => {
    switch (activeReaction) {
      case 'like':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'fire':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'rocket':
        return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30';
      default:
        return 'bg-muted/40 text-muted-foreground border-border/40 hover:text-primary hover:bg-primary/5 hover:border-primary/20';
    }
  };

  const getTriggerIcon = () => {
    switch (activeReaction) {
      case 'like':
        return 'fluent:thumb-like-16-filled';
      case 'fire':
        return 'fluent:fire-16-filled';
      case 'rocket':
        return 'fluent:rocket-16-filled';
      default:
        return 'fluent:thumb-like-16-regular';
    }
  };

  const getTriggerText = () => {
    switch (activeReaction) {
      case 'like':
        return 'Liked';
      case 'fire':
        return 'Fire';
      case 'rocket':
        return 'Rocket';
      default:
        return 'React';
    }
  };

  // Compile overall counts for reactions
  const reactionTypes = ['like', 'fire', 'rocket'] as const;
  const reactionsSummary = reactionTypes
    .map((t) => ({ type: t, count: reactionData ? reactionData[t] : 0 }))
    .filter((r) => r.count > 0);

  // Formulate social share URLs redirecting back to our news page
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hackforpinas.gg';
  const customShareUrl = `${origin}/news?link=${encodeURIComponent(article.link)}`;
  
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(customShareUrl)}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this Philippine tech update: "${article.title}"\n\n${customShareUrl}`)}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(customShareUrl)}`;
  const devToShare = `https://dev.to/new?prefill=${encodeURIComponent(`--- \ntitle: "${article.title}" \npublished: false \ntags: hackathon, tech, philippines \ncanonical_url: "${article.link}" \n--- \n\nOriginally posted on HackForPinas: [Read Article](${customShareUrl})\n\n${article.description}`)}`;

  return (
    <motion.div
      id={`news-card-${encodeURIComponent(article.link)}`}
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.25 }}
      onMouseEnter={startReadTimer}
      onMouseLeave={clearReadTimer}
      onFocus={startReadTimer}
      onBlur={clearReadTimer}
      tabIndex={0}
      className={cn(
        "group flex gap-4 w-full transition-all duration-300 outline-none rounded-xl p-2 -mx-2 hover:bg-card/30 focus-visible:bg-card/30 border",
        isRead ? "opacity-60" : "opacity-100",
        isHighlighted
          ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(235,94,85,0.15)] ring-1 ring-primary/30"
          : "border-transparent"
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
          {/* Glowing Unread Indicator Dot */}
          {!isRead && (
            <span className="relative flex h-2 w-2 mr-0.5" title="Unread Article">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
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
          {isHighlighted && (
            <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded font-bold uppercase animate-pulse">
              Shared Article
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 relative">
          {/* Facebook-style Action Trigger and Counts */}
          <div className="flex items-center gap-3 select-none">
            {/* Reaction Trigger Button Container */}
            <div 
              className="relative"
              onMouseEnter={handleTriggerMouseEnter}
              onMouseLeave={handleTriggerMouseLeave}
            >
              {/* Main Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDirectClick}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 min-h-[30px] outline-none focus-visible:ring-1 focus-visible:ring-primary",
                  getTriggerStyles()
                )}
                aria-label="React to post"
              >
                <Icon icon={getTriggerIcon()} width={15} />
                <span>{getTriggerText()}</span>
              </motion.button>

              {/* Hover Floating Reaction Tray Popover */}
              <AnimatePresence>
                {showTray && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0, scale: 0.7, y: 12 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                          staggerChildren: 0.04
                        }
                      }
                    }}
                    onMouseEnter={handleTrayMouseEnter}
                    onMouseLeave={handleTrayMouseLeave}
                    className="absolute bottom-full left-0 mb-2.5 bg-card/95 backdrop-blur-md border border-border/80 rounded-full py-1.5 px-3 shadow-2xl flex gap-3 items-center z-40"
                    style={{ transformOrigin: 'bottom left' }}
                  >
                    {([
                      { type: 'like', iconName: 'fluent:thumb-like-16-regular', activeIconName: 'fluent:thumb-like-16-filled', label: 'Like', hoverColor: 'hover:text-blue-400 hover:scale-120' },
                      { type: 'fire', iconName: 'fluent:fire-16-regular', activeIconName: 'fluent:fire-16-filled', label: 'Fire', hoverColor: 'hover:text-orange-400 hover:scale-120' },
                      { type: 'rocket', iconName: 'fluent:rocket-16-regular', activeIconName: 'fluent:rocket-16-filled', label: 'Rocket', hoverColor: 'hover:text-indigo-400 hover:scale-120' }
                    ] as const).map((item) => {
                      const hasReacted = reactionData ? !!reactionData.userReacted[item.type] : false;
                      return (
                        <motion.button
                          key={item.type}
                          variants={{
                            hidden: { scale: 0, y: 10 },
                            visible: { 
                              scale: 1, 
                              y: 0, 
                              transition: { type: "spring", stiffness: 400, damping: 14 } 
                            }
                          }}
                          whileHover={{ 
                            scale: 1.25, 
                            rotate: [0, -8, 8, -8, 0],
                            transition: { duration: 0.3 }
                          }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => selectReaction(item.type)}
                          className={cn(
                            "w-8 h-8 rounded-full border border-border/20 flex items-center justify-center bg-card cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-primary",
                            hasReacted 
                              ? (item.type === 'like' ? 'text-blue-500' : (item.type === 'fire' ? 'text-orange-500' : 'text-indigo-500'))
                              : "text-muted-foreground " + item.hoverColor
                          )}
                          aria-label={item.label}
                        >
                          <Icon icon={hasReacted ? item.activeIconName : item.iconName} width={18} />
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reaction counts summary grouped nicely next to action trigger */}
            {reactionsSummary.length > 0 && (
              <div className="flex items-center gap-1 select-none">
                {reactionsSummary.map((r) => {
                  let icon = 'fluent:thumb-like-16-filled';
                  let color = 'text-blue-500';
                  if (r.type === 'fire') { icon = 'fluent:fire-16-filled'; color = 'text-orange-500'; }
                  if (r.type === 'rocket') { icon = 'fluent:rocket-16-filled'; color = 'text-indigo-500'; }
                  return (
                    <span key={r.type} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full border border-border/5">
                      <Icon icon={icon} className={color} width={12} />
                      <span className="font-mono text-[10px]">{r.count}</span>
                    </span>
                  );
                })}
              </div>
            )}
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

            {/* Floating Share Menu Popover trigger */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={cn(
                  'inline-flex items-center gap-1 transition-colors py-1 min-h-[32px] cursor-pointer font-medium border-0 bg-transparent outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  isCopied ? 'text-emerald-400' : 'hover:text-primary'
                )}
                aria-label="Toggle share options"
              >
                <Icon icon={isCopied ? 'fluent:checkmark-16-filled' : 'fluent:share-android-16-regular'} width={14} />
                {isCopied ? 'Copied' : 'Share'}
              </button>

              {/* Share Popover Accordion List */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: "spring", stiffness: 450, damping: 20 }}
                    className="absolute bottom-full right-0 mb-2.5 bg-card/95 border border-border/80 rounded-xl py-2 px-1 shadow-2xl z-50 flex flex-col gap-1 w-44 backdrop-blur-md"
                    style={{ transformOrigin: 'bottom right' }}
                  >
                    {/* Copy Link Option */}
                    <button
                      onClick={() => {
                        onShare(article.title, article.link);
                        setShowShareMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md w-full text-left transition-colors cursor-pointer"
                    >
                      <Icon icon={isCopied ? "fluent:checkmark-16-filled" : "fluent:copy-16-regular"} className={cn("w-4 h-4", isCopied && "text-emerald-400")} />
                      {isCopied ? "Copied Redirect!" : "Copy Share Link"}
                    </button>

                    {/* Divider line */}
                    <div className="h-px bg-border/40 mx-2 my-0.5" />

                    {/* Social links */}
                    <a
                      href={facebookShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowShareMenu(false);
                        onMarkAsRead();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md w-full text-left transition-colors"
                    >
                      <Icon icon="logos:facebook" className="w-4 h-4" />
                      Facebook
                    </a>

                    <a
                      href={whatsappShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowShareMenu(false);
                        onMarkAsRead();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md w-full text-left transition-colors"
                    >
                      <Icon icon="logos:whatsapp-icon" className="w-4 h-4" />
                      WhatsApp
                    </a>

                    <a
                      href={linkedinShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowShareMenu(false);
                        onMarkAsRead();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md w-full text-left transition-colors"
                    >
                      <Icon icon="logos:linkedin-icon" className="w-4 h-4" />
                      LinkedIn
                    </a>

                    <a
                      href={devToShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowShareMenu(false);
                        onMarkAsRead();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md w-full text-left transition-colors"
                    >
                      <Icon icon="logos:devto" className="w-4 h-4 bg-white rounded-sm" />
                      Dev.to Post
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

export default function NewsFeedClient({ articles, initialLink }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'government' | 'media' | 'unread'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Highlight URL Matching state
  const [highlightedLink, setHighlightedLink] = useState<string | null>(initialLink || null);

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

  // Handle URL deep-linking matching highlight & auto-scroll
  useEffect(() => {
    if (!initialLink || articles.length === 0) return;

    // Reset categories so that the linked article isn't hidden
    setCategory('all');

    // Perform smooth scrolling to the matching target card
    const timer = setTimeout(() => {
      const targetCard = document.getElementById(`news-card-${encodeURIComponent(initialLink)}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Automatically trigger unread-to-read transition
        markAsRead(initialLink);
      }
    }, 600);

    // Dissipate neon highlight glow after 4 seconds
    const glowTimer = setTimeout(() => {
      setHighlightedLink(null);
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(glowTimer);
    };
  }, [initialLink, articles]);

  const filteredArticles = articles.filter((item) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSource = item.sourceName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSource) return false;
    }

    // Category and Read/Unread filters
    if (category === 'unread') {
      if (readLinks.includes(item.link)) return false;
    } else if (category !== 'all') {
      if (item.sourceCategory !== category) return false;
    }

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

  const handleShare = async (title: string, url: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hackforpinas.gg';
    const redirectUrl = `${origin}/news?link=${encodeURIComponent(url)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this tech update: "${title}"`,
          url: redirectUrl,
        });
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
      } catch (err) {
        console.warn('Native share failed or canceled, copying redirect link to clipboard:', err);
        handleCopy(redirectUrl);
      }
    } else {
      handleCopy(redirectUrl);
    }
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
  
  // Calculate total unread count for badge
  const totalUnreadCount = isMounted 
    ? articles.filter(item => !readLinks.includes(item.link)).length
    : 0;

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
      {/* ── Sticky Filter Bar ───────────────────── */}
      <div className="sticky top-16 z-30 border-b bg-background/95 py-4 backdrop-blur-sm flex flex-col gap-4">
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

          {/* Category & Unread Pills */}
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
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
            
            {/* Sleek Unread Filter Pill with Count Badge */}
            <button
              role="tab"
              aria-selected={category === 'unread'}
              onClick={() => setCategory('unread')}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all duration-200 min-h-[38px] flex items-center gap-1.5 justify-center relative overflow-hidden',
                category === 'unread'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              )}
            >
              Unread
              {totalUnreadCount > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.2 text-[9px] font-bold font-mono transition-colors",
                  category === 'unread' 
                    ? "bg-primary-foreground text-primary" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {totalUnreadCount}
                </span>
              )}
            </button>
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
                  onShare={handleShare}
                  isCopied={copiedUrl === article.link}
                  reactionData={reactions[article.link]}
                  onReact={(type) => handleReact(article.link, type)}
                  isHighlighted={highlightedLink === article.link}
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
