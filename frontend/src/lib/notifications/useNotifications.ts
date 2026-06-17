import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "./types";
import {
  emitNotificationsChanged,
  listNotifications,
  markAllNotificationsRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from "./store";

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await listNotifications(userId);
      setNotifications(rows);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
  }, [userId]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount, markAllRead, refresh, loading };
}

export { emitNotificationsChanged };
