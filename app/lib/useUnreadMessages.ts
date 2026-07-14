"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";

export function useUnreadMessagesCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkUnread() {
      if (!user) {
        await Promise.resolve();
        if (!cancelled) setCount(0);
        return;
      }
      try {
        const res = await fetch("/api/messages/unread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const result = await res.json();
        if (!cancelled && result.notifications) setCount(result.notifications.length);
      } catch { /* ignore */ }
    }

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  return count;
}
