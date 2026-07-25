"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

export interface MsgNotifItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
}

/**
 * Unread admin→user message. Two flavours live in the same `admin_messages`
 * table and are read in two different places, so each item carries its own
 * destination:
 *  - personal (`is_global: false`, addressed to this user) → /support-chat
 *  - global broadcast (`is_global: true`, one shared row) → /messages
 */
export interface AdminNotifItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isGlobal: boolean;
  href: string;
}

interface UnreadMessagesContextValue {
  notifications: MsgNotifItem[];
  count: number;
  dismissConversation: (conversationId: string) => void;
  adminNotifications: AdminNotifItem[];
  adminCount: number;
  dismissAdmin: (id: string) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  notifications: [],
  count: 0,
  dismissConversation: () => {},
  adminNotifications: [],
  adminCount: 0,
  dismissAdmin: () => {},
});

/**
 * Single source of truth for unread peer-message notifications. ONE poller
 * lives here (mounted once at the provider level); both the bottom-nav badge
 * and the header notification list read from this context, so we never run
 * duplicate `/api/messages/unread` polls.
 */
export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MsgNotifItem[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotifItem[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setAdminNotifications([]);
      return;
    }
    let cancelled = false;

    async function checkUnread() {
      try {
        const res = await fetch("/api/messages/unread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user!.id }),
        });
        const result = await res.json();
        if (!cancelled && result.notifications) {
          setNotifications(result.notifications as MsgNotifItem[]);
        }
      } catch {
        /* ignore transient network errors — next tick retries */
      }
    }

    // `/api/messages/unread` covers peer messages (`user_messages`) only.
    // Admin messages are a separate table, read here through the RLS-scoped
    // anon client — the same query ProfileDrawer and /messages already use.
    async function checkAdminUnread() {
      try {
        const [personal, global] = await Promise.all([
          supabase
            .from("admin_messages")
            .select("id, title, message, created_at")
            .eq("user_id", user!.id)
            .eq("is_global", false)
            .eq("sender", "admin")
            .eq("is_read", false)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("admin_messages")
            .select("id, title, message, created_at")
            .eq("is_global", true)
            .eq("is_read", false)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);
        if (cancelled) return;

        type Row = { id: string; title: string | null; message: string | null; created_at: string };
        const toItem = (isGlobal: boolean) => (r: Row): AdminNotifItem => ({
          id: r.id,
          title: r.title ?? "",
          message: r.message ?? "",
          createdAt: r.created_at,
          isGlobal,
          href: isGlobal ? "/messages" : "/support-chat",
        });

        const items = [
          ...((personal.data ?? []) as Row[]).map(toItem(false)),
          ...((global.data ?? []) as Row[]).map(toItem(true)),
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setAdminNotifications(items);
      } catch {
        /* ignore transient network errors — next tick retries */
      }
    }

    function poll() {
      checkUnread();
      checkAdminUnread();
    }

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const dismissConversation = useCallback((conversationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.conversationId !== conversationId));
  }, []);

  // Optimistic only — opening /support-chat or /messages persists is_read, and
  // the next poll is the source of truth.
  const dismissAdmin = useCallback((id: string) => {
    setAdminNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return createElement(
    UnreadMessagesContext.Provider,
    {
      value: {
        notifications,
        count: notifications.length,
        dismissConversation,
        adminNotifications,
        adminCount: adminNotifications.length,
        dismissAdmin,
      },
    },
    children,
  );
}

/** Full unread-message notifications (list + count + dismiss helper). */
export function useUnreadMessages(): UnreadMessagesContextValue {
  return useContext(UnreadMessagesContext);
}

/** Convenience hook for the bottom-nav badge: just the unread count. */
export function useUnreadMessagesCount(): number {
  return useContext(UnreadMessagesContext).count;
}
