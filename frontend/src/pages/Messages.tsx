import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Circle,
  Send,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { useDevice } from "@/lib/device";
import { useDashboardStore } from "@/lib/dashboardStore";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Messages() {
  const { user } = useAuth();
  const { isCompact } = useDevice();
  const store = useDashboardStore();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [draft, setDraft] = useState("");

  const threads = useMemo(() => {
    const list = user ? store.getUserThreads(user.id) : store.threads;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.participantName.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        (t.listingTitle?.toLowerCase().includes(q) ?? false)
    );
  }, [user, store, search]);

  const active = threads.find((t) => t.id === activeId) ?? threads[0] ?? null;

  useEffect(() => {
    if (!isCompact) setShowChat(false);
  }, [isCompact]);

  const showList = !isCompact || !showChat;
  const showConversation = !isCompact || showChat;

  function openThread(id: string) {
    setActiveId(id);
    store.markThreadRead(id);
    if (isCompact) setShowChat(true);
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-slate-50/60 pb-12 pt-6 sm:pt-8">
      <div className="container max-w-5xl">
        {!showChat && (
          <>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>

            <div className="mt-4 flex items-center justify-between sm:mt-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Messages</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {threads.filter((t) => t.unread).length} unread · encrypted in transit
                </p>
              </div>
              <MessageCircle className="h-7 w-7 text-brand-600 opacity-80 sm:h-8 sm:w-8" />
            </div>

            <div className="relative mt-4 sm:mt-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 sm:text-sm"
              />
            </div>
          </>
        )}

        <div
          className={cn(
            "mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6",
            isCompact ? "min-h-[calc(100dvh-12rem)]" : "lg:min-h-[480px]",
            !isCompact && "grid lg:grid-cols-[320px_1fr]"
          )}
        >
          {showList && (
            <ul
              className={cn(
                "divide-y divide-slate-100",
                !isCompact && "border-b border-slate-100 lg:border-b-0 lg:border-r"
              )}
            >
              {threads.length === 0 ? (
                <li className="p-6 text-center text-sm text-slate-500">No conversations found.</li>
              ) : (
                threads.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openThread(t.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50",
                        active?.id === t.id && "bg-brand-50/60"
                      )}
                    >
                      <Avatar src={t.participantAvatar} name={t.participantName} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-slate-900">
                            {t.participantName}
                          </span>
                          {t.verified && (
                            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                          )}
                        </div>
                        <p className="truncate text-sm text-slate-600">{t.lastMessage}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <span className="text-xs text-slate-400">{relativeTime(t.updatedAt)}</span>
                        {t.unread && (
                          <Circle className="h-2 w-2 fill-brand-600 text-brand-600" />
                        )}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {showConversation && (
            <div className="flex min-h-[320px] flex-col">
              {active ? (
                <>
                  <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      {isCompact && (
                        <button
                          type="button"
                          onClick={() => setShowChat(false)}
                          className="inline-flex h-10 w-10 touch-target items-center justify-center rounded-lg hover:bg-slate-100"
                          aria-label="Back to conversations"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      )}
                      <Avatar
                        src={active.participantAvatar}
                        name={active.participantName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{active.participantName}</p>
                        {active.listingTitle && (
                          <p className="truncate text-xs text-brand-600">{active.listingTitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800">
                      {active.lastMessage}
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-3 text-sm text-white">
                      Thanks for reaching out — I'll get back to you shortly!
                    </div>
                  </div>
                  <form
                    className="flex gap-2 border-t border-slate-100 p-3 sm:p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDraft("");
                    }}
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message…"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 sm:text-sm"
                    />
                    <Button type="submit" size="md" className="touch-target shrink-0 px-4">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
                  Select a conversation
                </div>
              )}
            </div>
          )}
        </div>

        {!showChat && (
          <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Khaleej shield
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Contact details stay hidden until both sides tap <strong>Reveal contact</strong>.
            </p>
            <Link to="/match/seeker">
              <Button variant="outline" size="sm" className="mt-3 bg-white">
                Open match inbox
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
