import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  Sparkles,
  Tag,
  CheckCircle2,
  Bookmark,
  MapPin,
} from "lucide-react";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { relativeNotificationTime } from "@/lib/notifications/store";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { cn } from "@/lib/utils";

const STATIC_NOTIFS = [
  {
    id: "static-n1",
    icon: Sparkles,
    iconBg: "bg-brand-100 text-brand-700",
    title: "3 new compatible roommates found",
    body: "Match scores 88-94% based on your profile.",
    href: "/match/seeker",
    time: "Just now",
    unread: true,
  },
  {
    id: "static-n2",
    icon: Bookmark,
    iconBg: "bg-emerald-100 text-emerald-700",
    title: "New listing matches your saved search",
    body: "Marina · 2BR · ≤ 6,000 AED — 1 new this morning.",
    href: "/saved-searches",
    time: "2 h ago",
    unread: true,
  },
  {
    id: "static-n3",
    icon: MessageCircle,
    iconBg: "bg-sky-100 text-sky-700",
    title: "Aisha replied to your message",
    body: "“Sure, you can view the room tomorrow at 6 pm…”",
    href: "/dashboard",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "static-n4",
    icon: Tag,
    iconBg: "bg-amber-100 text-amber-700",
    title: "Price drop on a favourite",
    body: "Downtown Burj-view room dropped 500 AED.",
    href: "/wishlist",
    time: "2 d ago",
  },
  {
    id: "static-n5",
    icon: CheckCircle2,
    iconBg: "bg-slate-100 text-slate-700",
    title: "Your listing was approved",
    body: "‘Cozy partition — Bur Dubai’ is live.",
    href: "/dashboard",
    time: "3 d ago",
  },
] as const;

export function NotificationBell() {
  const { profile } = useMatchProfile();
  const { notifications, unreadCount, markAllRead } = useNotifications(profile.userId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [staticRead, setStaticRead] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const reviewNotifs = notifications.map((n) => ({
    id: n.id,
    icon: MapPin,
    iconBg: "bg-amber-100 text-amber-800",
    title: n.title,
    body: n.body,
    href: n.href,
    time: relativeNotificationTime(n.createdAt),
    unread: n.unread,
  }));

  const staticNotifs = STATIC_NOTIFS.map((n) => ({
    ...n,
    unread: staticRead ? false : n.unread,
  }));

  const notifs = [...reviewNotifs, ...staticNotifs];
  const unread = unreadCount + (staticRead ? 0 : staticNotifs.filter((n) => n.unread).length);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 relative"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-bold text-slate-900">Notifications</div>
            <button
              onClick={() => {
                markAllRead();
                setStaticRead(true);
              }}
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifs.map(({ icon: Icon, ...n }) => (
                <Link
                  key={n.id}
                  to={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50",
                    n.unread && "bg-brand-50/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                      n.iconBg
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-slate-900">
                        {n.title}
                      </p>
                      {n.unread && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.body}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                      {n.time}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg py-2 text-center text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              View all activity →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
