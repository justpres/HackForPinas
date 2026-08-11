'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useChat } from './ChatProvider';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const {
    isOpen,
    setIsOpen,
    username,
    avatarColor,
    messages,
    onlineUsers,
    onlineCount,
    sendMessage,
    isLoading,
    featuredEvent,
    privateMessages,
    sendPrivateMessage,
    deleteConversation,
  } = useChat();

  const [text, setText] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0); // in ms
  const [isSending, setIsSending] = useState(false);
  const cooldownDuration = 1500; // 1.5 seconds cooldown

  // Direct Messaging states
  const [activeDmUser, setActiveDmUser] = useState<string | null>(null);
  const [lastReadTimeByUser, setLastReadTimeByUser] = useState<Record<string, string>>({});
  
  // Local storage diagnostic states
  const [storagePercentage, setStoragePercentage] = useState('100.00% Available');
  const [remainingSlots, setRemainingSlots] = useState(0);

  // Touch gesture refs for mobile swipe-to-close
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      const container = scrollContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        if (isNearBottom || messages.length <= 1 || (activeDmUser && privateMessages.length <= 1)) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, privateMessages, isOpen, activeDmUser]);

  // Handle focus when sidebar opens or DM user changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isOpen, activeDmUser]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownTime]);

  // Load and sync last read timestamps for DMs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedReadTimes = localStorage.getItem('hfp_chat_dm_read_times');
      if (storedReadTimes) {
        try {
          setLastReadTimeByUser(JSON.parse(storedReadTimes));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Update read receipt timestamp when actively chatting with a user
  useEffect(() => {
    if (activeDmUser) {
      const nowStr = new Date().toISOString();
      setLastReadTimeByUser((prev) => {
        const updated = { ...prev, [activeDmUser]: nowStr };
        localStorage.setItem('hfp_chat_dm_read_times', JSON.stringify(updated));
        return updated;
      });
    }
  }, [activeDmUser, privateMessages]);

  // Measure localStorage capacity periodically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += key.length + (localStorage.getItem(key)?.length || 0);
        }
      }
      
      const totalLimit = 5 * 1024 * 1024; // Standard 5MB limit
      const availablePercentage = ((totalLimit - totalBytes) / totalLimit) * 100;
      
      setStoragePercentage(`${availablePercentage.toFixed(3)}% Available`);
      
      // Standard local setting state is around 80 bytes, calculate message slots
      const slots = Math.floor((totalLimit - totalBytes) / 80);
      setRemainingSlots(slots);
    }
  }, [privateMessages, activeDmUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || cooldownTime > 0 || isSending) return;

    setIsSending(true);
    let sent = false;

    if (activeDmUser) {
      sent = await sendPrivateMessage(activeDmUser, text);
    } else {
      sent = await sendMessage(text);
    }

    setIsSending(false);

    if (sent) {
      setText('');
      setCooldownTime(cooldownDuration);
      inputRef.current?.focus();
    }
  };

  // Calculate unread DM messages count from a sender
  const getUnreadCountFrom = (sender: string) => {
    const lastRead = lastReadTimeByUser[sender] || '1970-01-01T00:00:00.000Z';
    return privateMessages.filter(
      (m) => m.sender === sender && m.receiver === username && m.created_at > lastRead
    ).length;
  };

  // Filter messages for Direct Chat
  const dmMessages = activeDmUser
    ? privateMessages.filter(
        (m) =>
          (m.sender === username && m.receiver === activeDmUser) ||
          (m.sender === activeDmUser && m.receiver === username)
      )
    : [];

  // Get list of users we have chatted with recently in the last 24h log
  const getRecentDmUsers = () => {
    const users = new Set<string>();
    privateMessages.forEach((m) => {
      if (m.sender === username) users.add(m.receiver);
      if (m.receiver === username) users.add(m.sender);
    });
    return Array.from(users);
  };
  
  const recentDmUsers = getRecentDmUsers();

  // Mobile touch swipe-to-close handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndXRef.current - touchStartXRef.current;
    // If user swiped right by more than 50px, close the sidebar drawer
    if (deltaX > 50 && touchEndXRef.current !== 0) {
      setIsOpen(false);
    }
    // Reset touch coordinates
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  // Cooldown circle SVG calculations
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    cooldownTime > 0 ? circumference - (cooldownTime / cooldownDuration) * circumference : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.22 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={cn(
              'fixed top-0 right-0 h-[100dvh] z-50 flex flex-col',
              'w-full sm:max-w-[380px] border-l bg-background/98 shadow-2xl',
              'border-border/30'
            )}
          >
            {/* Custom high-performance CSS animation to avoid JS-driven Framer Motion overhead */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes slideInUp {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-message-slide {
                animation: slideInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}} />
            {/* Header: DM mode or General Lobby mode */}
            {activeDmUser ? (
              <div className="flex items-center justify-between border-b p-4 border-border/20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDmUser(null)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                    aria-label="Back to general lobby"
                    title="Back to general lobby"
                  >
                    <Icon icon="fluent:arrow-left-16-regular" width={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border/20 bg-accent/20">
                      <img
                        src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(activeDmUser)}`}
                        alt={activeDmUser}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="text-sm font-bold tracking-tight text-foreground truncate max-w-[140px]">
                        {activeDmUser}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Direct Message</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <Icon icon="fluent:dismiss-16-regular" width={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b p-4 border-border/20">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-md font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    <Icon icon="fluent:chat-24-filled" className="text-primary" width={20} />
                    Tambayan Lobby
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {/* Solid Green Indicator Dot (No pulse) */}
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{onlineCount} active coder{onlineCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <Icon icon="fluent:dismiss-16-regular" width={18} />
                </button>
              </div>
            )}

            {/* Online Users Avatars Bar (Hidden when in Direct DMs) */}
            {!activeDmUser && (
              <div className="px-4 py-1 border-b border-border/10 bg-accent/10 flex items-center gap-1.5 min-h-[48px]">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mr-1">
                  Lobby:
                </span>
                <div className="flex-1 flex gap-2.5 overflow-x-auto py-2 px-2 scrollbar-none">
                  {onlineUsers.map((user) => (
                    <div
                      key={user.username}
                      onClick={() => user.username !== username && setActiveDmUser(user.username)}
                      title={user.username === username ? `${user.username} (You)` : `Chat with ${user.username}`}
                      className="relative shrink-0 w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-105"
                    >
                      <div className="w-full h-full rounded-full border border-background bg-accent/20 overflow-hidden">
                        <img
                          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(user.username)}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.username === username && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent DM Partners Bar ("Chats:") */}
            {!activeDmUser && recentDmUsers.length > 0 && (
              <div className="px-4 py-1 border-b border-border/10 bg-accent/5 flex items-center gap-1.5 min-h-[48px]">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mr-1">
                  Chats:
                </span>
                <div className="flex-1 flex gap-2.5 overflow-x-auto py-2 px-2 scrollbar-none">
                  {recentDmUsers.map((dmUser) => {
                    const isOnline = onlineUsers.some((u) => u.username === dmUser);
                    return (
                      <div
                        key={dmUser}
                        onClick={() => setActiveDmUser(dmUser)}
                        title={`Chat with ${dmUser} (${isOnline ? 'Online' : 'Offline'})`}
                        className="relative shrink-0 w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-105 group"
                      >
                        {/* Delete Conversation Button (Visible on Hover at Top-Left) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeDmUser === dmUser) {
                              setActiveDmUser(null);
                            }
                            deleteConversation(dmUser);
                          }}
                          className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-neutral-900 border border-border/50 text-[9px] flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/40 shadow-sm transition-all z-20 cursor-pointer flex md:hidden md:group-hover:flex animate-fade-in"
                          title={`Delete conversation with ${dmUser}`}
                          aria-label={`Delete conversation with ${dmUser}`}
                        >
                          <Icon icon="fluent:dismiss-12-regular" width={10} />
                        </button>

                        <div className="w-full h-full rounded-full border border-background bg-accent/20 overflow-hidden">
                          <img
                            src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(dmUser)}`}
                            alt={dmUser}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neutral-500 border-2 border-background" />
                        )}
                        {getUnreadCountFrom(dmUser) > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white border-2 border-background shadow-md">
                            {getUnreadCountFrom(dmUser)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Redesigned Premium Featured Event Pinned Banner */}
            {!activeDmUser && featuredEvent && (
              <div className="mx-4 mt-3 p-3 rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent flex items-center gap-3 shadow-md text-xs relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-500" />
                
                {/* Cover Image Thumbnail */}
                {featuredEvent.poster_image_url && (
                  <img
                    src={featuredEvent.poster_image_url}
                    alt={featuredEvent.title}
                    className="w-11 h-11 rounded object-cover border border-amber-500/25 shrink-0 bg-background"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold tracking-wider uppercase mb-0.5">
                    <Icon icon="fluent:pin-16-filled" width={12} />
                    Pinned Event
                  </div>
                  <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {featuredEvent.title}
                  </div>
                  <div className="flex gap-1.5 mt-1 shrink-0">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                      {featuredEvent.format}
                    </span>
                    <span className="bg-accent/40 text-muted-foreground px-1.5 py-0.5 rounded text-[8px] font-medium truncate max-w-[90px]">
                      {featuredEvent.region}
                    </span>
                  </div>
                </div>
                
                <Link
                  href={`/events/${featuredEvent.id}`}
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-primary/5 hover:bg-primary/10 p-1.5 rounded-md"
                >
                  View
                  <Icon icon="fluent:chevron-right-16-regular" width={10} />
                </Link>
              </div>
            )}

            {/* Chat Messages Feed Area */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Icon icon="fluent:spinner-16-regular" className="animate-spin text-primary" width={24} />
                  <span className="text-xs">Loading lobby log...</span>
                </div>
              ) : activeDmUser ? (
                // DM Mode Chat History
                dmMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border/20 bg-accent/20 mb-3">
                      <img
                        src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(activeDmUser)}`}
                        alt={activeDmUser}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-semibold">Start of Direct Chat</p>
                    <p className="text-xs mt-1 max-w-[220px]">
                      Guest messages self-delete in 24h. DMs are not encrypted; do not send sensitive data.
                    </p>
                  </div>
                ) : (
                  dmMessages.map((msg) => {
                    const isMe = msg.sender === username;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex gap-2.5 items-start animate-message-slide", isMe && "flex-row-reverse")}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border/10 bg-accent/20 shrink-0">
                          <img
                            src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(msg.sender)}`}
                            alt={msg.sender}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-xs font-semibold text-foreground/90">
                              {msg.sender}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "rounded-2xl px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-accent/40 text-foreground border border-border/10 rounded-tl-none"
                            )}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                // General Lobby Mode Chat History
                messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                    <Icon icon="fluent:chat-empty-24-regular" width={32} className="opacity-40 mb-2" />
                    <p className="text-sm font-semibold">Welcome to the Tambayan!</p>
                    <p className="text-xs mt-1 max-w-[200px]">Be the first to speak. Say hello to fellow PH hackers!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.username === username;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex gap-2.5 items-start animate-message-slide", isMe && "flex-row-reverse")}
                      >
                        {/* Clickable Avatar to DM */}
                        <div
                          onClick={() => !isMe && setActiveDmUser(msg.username)}
                          title={!isMe ? `Direct message ${msg.username}` : undefined}
                          className="w-8 h-8 rounded-full overflow-hidden border border-border/10 bg-accent/20 shrink-0 cursor-pointer transition-transform hover:scale-105"
                        >
                          <img
                            src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(msg.username)}`}
                            alt={msg.username}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span
                              onClick={() => !isMe && setActiveDmUser(msg.username)}
                              className={cn(
                                "text-xs font-semibold text-foreground/90",
                                !isMe && "cursor-pointer hover:underline hover:text-primary"
                              )}
                              title={!isMe ? `Direct message ${msg.username}` : undefined}
                            >
                              {msg.username}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div
                            className={cn(
                              "rounded-2xl px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-accent/40 text-foreground border border-border/10 rounded-tl-none"
                            )}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="border-t p-4 border-border/20 bg-background/60">
              {/* Identity Display (Shuffle name is removed to prevent DM disruption) */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Posting as:</span>
                  <span className="font-bold text-primary">{username}</span>
                </div>
                
                {/* Live localStorage Storage Remaining indicator */}
                <div 
                  className="text-[10px] text-muted-foreground font-mono select-none"
                  title="Accuracy diagnostic based on standard client-browser session memory limits"
                >
                  Storage: {storagePercentage}
                </div>
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 250))}
                  placeholder={activeDmUser ? `Reply to ${activeDmUser}...` : "Say hello or look for a team..."}
                  disabled={cooldownTime > 0 || isSending}
                  className={cn(
                    "flex-1 rounded-md px-3.5 py-2.5 text-sm bg-accent/25 border border-border/30",
                    "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                />
                
                <button
                  type="submit"
                  disabled={!text.trim() || cooldownTime > 0 || isSending}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md shrink-0 transition-all",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/95 focus:outline-none focus:ring-1 focus:ring-ring",
                    "disabled:bg-accent/40 disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                  )}
                  aria-label="Send message"
                >
                  {cooldownTime > 0 ? (
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <svg className="w-5 h-5 -rotate-90">
                        <circle
                          cx="10"
                          cy="10"
                          r={radius}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="opacity-20"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r={radius}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-100 ease-linear"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-bold">
                        {Math.ceil(cooldownTime / 1000)}
                      </span>
                    </div>
                  ) : isSending ? (
                    <Icon icon="fluent:spinner-16-regular" className="animate-spin" width={18} />
                  ) : (
                    <Icon icon="fluent:send-16-filled" width={18} />
                  )}
                </button>
              </form>

              {/* Slots diagnostic footer */}
              <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-muted-foreground/70">
                <span>{activeDmUser ? `Private DM with ${activeDmUser}` : "Respect fellow developers."}</span>
                <span title="Approximate available text slots remaining inside browser memory space">
                  {text.length}/250 (~{remainingSlots.toLocaleString()} slots left)
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
