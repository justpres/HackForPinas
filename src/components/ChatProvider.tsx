'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateUsername, getRandomColor } from '@/lib/username-generator';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar_color: string;
  created_at: string;
}

export interface OnlineUser {
  username: string;
  avatarColor: string;
  onlineAt: string;
}

export interface PrivateMessage {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  username: string;
  avatarColor: string;
  messages: ChatMessage[];
  onlineUsers: OnlineUser[];
  onlineCount: number;
  shuffleUsername: () => void;
  sendMessage: (text: string) => Promise<boolean>;
  isLoading: boolean;
  unreadCount: number;
  featuredEvent: any;
  privateMessages: PrivateMessage[];
  sendPrivateMessage: (receiver: string, text: string) => Promise<boolean>;
  deleteConversation: (targetUser: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);

  // Keep references to latest username and isOpen state to prevent stale closures in subscriptions
  const usernameRef = React.useRef(username);
  const isOpenRef = React.useRef(isOpen);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Reset unread count when sidebar is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Initialize username and avatar color from localStorage or generate new ones
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedUsername = localStorage.getItem('hfp_chat_username');
      let storedColor = localStorage.getItem('hfp_chat_avatar_color');

      if (!storedUsername || !storedColor) {
        storedUsername = generateUsername();
        storedColor = getRandomColor();
        localStorage.setItem('hfp_chat_username', storedUsername);
        localStorage.setItem('hfp_chat_avatar_color', storedColor);
      }

      setUsername(storedUsername);
      setAvatarColor(storedColor);
    }
  }, []);

  // Fetch initial chat messages (last 50)
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_lobby')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) {
          console.error('Error fetching chat messages:', error);
        } else if (data) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Error in fetchMessages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [supabase]);

  // Fetch private messages involving current user
  useEffect(() => {
    if (!username) return;

    const fetchPrivateMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('private_messages')
          .select('*')
          .or(`sender.eq.${username},receiver.eq.${username}`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching private messages:', error.message, error.details);
        } else if (data) {
          setPrivateMessages(data);
        }
      } catch (err) {
        console.error('Error in fetchPrivateMessages:', err);
      }
    };

    fetchPrivateMessages();
  }, [supabase, username]);

  // Fetch upcoming featured event (closest published deadline with image)
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select('id, title, deadline, format, region, poster_image_url')
          .eq('status', 'published')
          .gt('deadline', new Date().toISOString())
          .order('deadline', { ascending: true })
          .limit(1);

        if (error) {
          console.error('Error fetching featured event:', error);
        } else if (data && data.length > 0) {
          setFeaturedEvent(data[0]);
        }
      } catch (err) {
        console.error('Error in fetchFeaturedEvent:', err);
      }
    };

    fetchFeaturedEvent();
  }, [supabase]);

  // Subscribe to real-time chat updates
  useEffect(() => {
    const chatChannel = supabase
      .channel('chat_lobby_db_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_lobby' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Prevent duplicate logs
            if (prev.some((msg) => msg.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Increment unread count if sidebar is closed and message is not from current user
          if (!isOpenRef.current && newMsg.username !== usernameRef.current) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [supabase]);

  // Subscribe to real-time private messages
  useEffect(() => {
    const pmChannel = supabase
      .channel('private_messages_db_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'private_messages' },
        (payload) => {
          const newPm = payload.new as PrivateMessage;
          // Verify if current user is involved
          if (newPm.sender === usernameRef.current || newPm.receiver === usernameRef.current) {
            setPrivateMessages((prev) => {
              if (prev.some((msg) => msg.id === newPm.id)) return prev;
              return [...prev, newPm];
            });

            // Increment unread count if sidebar is closed
            if (!isOpenRef.current && newPm.sender !== usernameRef.current) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pmChannel);
    };
  }, [supabase]);

  // Subscribe to Presence (Online Users tracking)
  useEffect(() => {
    if (!username || !avatarColor) return;

    const presenceChannel = supabase.channel('online_tambayan', {
      config: {
        presence: {
          key: username,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const usersList: OnlineUser[] = [];

        Object.keys(state).forEach((key) => {
          const userPresences = state[key] as any[];
          if (userPresences && userPresences.length > 0) {
            usersList.push({
              username: key,
              avatarColor: userPresences[0].avatarColor || '#3B82F6',
              onlineAt: userPresences[0].onlineAt || new Date().toISOString(),
            });
          }
        });

        // Sort users alphabetically so the list is stable
        usersList.sort((a, b) => a.username.localeCompare(b.username));

        setOnlineUsers(usersList);
        setOnlineCount(usersList.length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await presenceChannel.track({
              avatarColor,
              onlineAt: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Error tracking presence:', err);
          }
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [supabase, username, avatarColor]);

  // Shuffle/Change username randomly
  const shuffleUsername = useCallback(() => {
    const newUsername = generateUsername();
    const newColor = getRandomColor();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hfp_chat_username', newUsername);
      localStorage.setItem('hfp_chat_avatar_color', newColor);
    }
    
    setUsername(newUsername);
    setAvatarColor(newColor);
  }, []);

  // Send a message to lobby
  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim() || !username || !avatarColor) return false;

    try {
      const { error } = await supabase.from('chat_lobby').insert({
        username,
        message: text.trim(),
        avatar_color: avatarColor,
      });

      if (error) {
        console.error('Error inserting message:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [supabase, username, avatarColor]);

  // Send a private message (DM)
  const sendPrivateMessage = useCallback(async (receiver: string, text: string): Promise<boolean> => {
    if (!text.trim() || !username || !receiver) return false;

    try {
      const { error } = await supabase.from('private_messages').insert({
        sender: username,
        receiver,
        message: text.trim(),
      });

      if (error) {
        console.error('Error inserting PM:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error in sendPrivateMessage:', err);
      return false;
    }
  }, [supabase, username]);

  // Delete all private messages between username and a target user
  const deleteConversation = useCallback(async (targetUser: string): Promise<boolean> => {
    if (!username || !targetUser) return false;

    try {
      // Optimistically filter the local state immediately
      setPrivateMessages((prev) =>
        prev.filter(
          (m) =>
            !(m.sender === username && m.receiver === targetUser) &&
            !(m.sender === targetUser && m.receiver === username)
        )
      );

      // Perform deletion in Supabase backend
      const { error } = await supabase
        .from('private_messages')
        .delete()
        .or(`and(sender.eq.${username},receiver.eq.${targetUser}),and(sender.eq.${targetUser},receiver.eq.${username})`);

      if (error) {
        console.error('Error deleting conversation:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error in deleteConversation:', err);
      return false;
    }
  }, [supabase, username]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        username,
        avatarColor,
        messages,
        onlineUsers,
        onlineCount,
        shuffleUsername,
        sendMessage,
        isLoading,
        unreadCount,
        featuredEvent,
        privateMessages,
        sendPrivateMessage,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
