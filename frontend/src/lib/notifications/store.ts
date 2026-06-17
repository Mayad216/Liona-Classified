import type { AppNotification } from "./types";
import { api, getStoredAuthToken } from "@/lib/api";

const STORAGE_KEY = "khaleej_notifications_v1";
export const NOTIFICATIONS_CHANGED_EVENT = "khaleej:notifications-changed";

function readAllLocal(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAllLocal(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function emitNotificationsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
}

function listNotificationsLocal(userId: string): AppNotification[] {
  return readAllLocal()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      const res = await api.notifications(token);
      return res.data;
    } catch {
      /* fall back to local cache */
    }
  }
  return listNotificationsLocal(userId);
}

export function notificationExistsLocal(id: string): boolean {
  return readAllLocal().some((n) => n.id === id);
}

export function upsertNotificationLocal(notification: AppNotification): void {
  const all = readAllLocal();
  const idx = all.findIndex((n) => n.id === notification.id);
  if (idx >= 0) {
    all[idx] = notification;
  } else {
    all.unshift(notification);
  }
  writeAllLocal(all);
  emitNotificationsChanged();
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await api.markAllNotificationsRead(token);
      emitNotificationsChanged();
      return;
    } catch {
      /* fall back */
    }
  }

  const all = readAllLocal();
  let changed = false;
  for (const n of all) {
    if (n.userId === userId && n.unread) {
      n.unread = false;
      changed = true;
    }
  }
  if (changed) {
    writeAllLocal(all);
    emitNotificationsChanged();
  }
}

export async function dismissNotification(id: string): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await api.dismissNotification(id, token);
      emitNotificationsChanged();
      return;
    } catch {
      /* fall back */
    }
  }

  const all = readAllLocal().filter((n) => n.id !== id);
  writeAllLocal(all);
  emitNotificationsChanged();
}

export async function dismissReviewPrompt(userId: string, areaId: string): Promise<void> {
  await dismissNotification(reviewPromptNotificationId(userId, areaId));
}

export function reviewPromptNotificationId(userId: string, areaId: string): string {
  return `review-prompt:${userId}:${areaId}`;
}

export function relativeNotificationTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} d ago`;
}
