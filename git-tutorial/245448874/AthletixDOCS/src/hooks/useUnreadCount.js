import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnread() {
    if (!user?.id) return;
    try {
      const participants = await fetchWithRetry(() =>
        base44.entities.ConversationParticipant.filter({ user_id: user.id })
      );
      const total = participants.reduce((sum, p) => sum + (p.unread_count || 0), 0);
      setUnreadCount(total);
    } catch {
      // Ignore errors — unread count is non-critical
    }
  }

  useEffect(() => {
    fetchUnread();
    // Poll every 2 minutes instead of every 30 seconds.
    // Users see unread counts refresh when navigating between pages (fetchUnread fires on mount).
    const interval = setInterval(fetchUnread, 120000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return unreadCount;
}