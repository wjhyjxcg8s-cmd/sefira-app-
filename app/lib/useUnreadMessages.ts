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

export interface MsgNotifItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
}

interface UnreadMessagesContextValue {
  notifications: MsgNotifItem[];
  count: number;
  dismissConversation: (conversationId: string) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  notifications: [],
  count: 0,
  dismissConversation: () => {},
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

  useEffect(() => {
    if (!user) {
      setNotifications([]);
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

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const dismissConversation = useCallback((conversationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.conversationId !== conversationId));
  }, []);

  return createElement(
    UnreadMessagesContext.Provider,
    { value: { notifications, count: notifications.length, dismissConversation } },
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
