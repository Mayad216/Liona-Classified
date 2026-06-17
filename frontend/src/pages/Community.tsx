import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Coffee,
  Loader2,
  MessageCircle,
  Sparkles,
  Users,
  MapPin,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AreaInsightCard } from "@/components/area/AreaInsightCard";
import { areaInsights } from "@/data/areaInsights";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  api,
  ApiError,
  getStoredAuthToken,
  type CommunityEventRow,
  type CommunityTopicRow,
} from "@/lib/api";

const FALLBACK_TOPICS: CommunityTopicRow[] = [
  {
    id: "t1",
    title: "Best areas under AED 2k near Metro?",
    replies: 42,
    tag: "Dubai",
    lastActivity: "12 min ago",
  },
  {
    id: "t2",
    title: "Tips for first-time sharers in Sharjah",
    replies: 28,
    tag: "Sharjah",
    lastActivity: "1 h ago",
  },
  {
    id: "t3",
    title: "Roommate agreement templates — what worked for you?",
    replies: 56,
    tag: "Legal",
    lastActivity: "3 h ago",
  },
  {
    id: "t4",
    title: "Female-only flat hunt — Marina vs JLT",
    replies: 19,
    tag: "Marina",
    lastActivity: "Yesterday",
  },
];

const FALLBACK_EVENTS: CommunityEventRow[] = [
  {
    id: "e1",
    title: "Khaleej Coffee Meet — Dubai Marina",
    date: "Sat 24 May · 4pm",
    spot: "Third Wave JBR",
    spots: 24,
    verifiedOnly: false,
  },
  {
    id: "e2",
    title: "Roommate speed-matching (verified only)",
    date: "Thu 29 May · 7pm",
    spot: "Hub71, Abu Dhabi",
    spots: 40,
    verifiedOnly: true,
  },
  {
    id: "e3",
    title: "Budget rooms workshop + legal Q&A",
    date: "Sun 1 Jun · 11am",
    spot: "Online · Zoom",
    spots: 200,
    verifiedOnly: false,
  },
];

export function Community() {
  const [topics, setTopics] = useState<CommunityTopicRow[]>(FALLBACK_TOPICS);
  const [events, setEvents] = useState<CommunityEventRow[]>(FALLBACK_EVENTS);
  const [liveData, setLiveData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("");
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [rsvpBusyId, setRsvpBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tRes, eRes] = await Promise.all([
          api.communityTopics(),
          api.communityEvents(),
        ]);
        if (cancelled) return;
        setTopics(tRes.data);
        setEvents(eRes.data);
        setLiveData(true);
        setLoadError(null);
      } catch {
        if (cancelled) return;
        setTopics(FALLBACK_TOPICS);
        setEvents(FALLBACK_EVENTS);
        setLiveData(false);
        setLoadError("Showing offline preview — start Laravel on :8000 for live community data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitTopic = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) {
      setBanner("Add a title for your topic.");
      return;
    }
    const token = getStoredAuthToken();
    if (!token) {
      setBanner("Sign in to post a topic.");
      return;
    }
    setTopicSubmitting(true);
    setBanner(null);
    try {
      const tag = newTag.trim() || undefined;
      const res = await api.communityCreateTopic({ title, tag }, token);
      setTopics((prev) => [res.data, ...prev]);
      setNewTitle("");
      setNewTag("");
      setComposerOpen(false);
      setBanner("Topic posted.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setBanner("Session expired — sign in again to post.");
      } else {
        setBanner("Could not create topic. Try again when the API is running.");
      }
    } finally {
      setTopicSubmitting(false);
    }
  }, [newTitle, newTag]);

  const rsvp = useCallback(async (eventId: string) => {
    const token = getStoredAuthToken();
    if (!token) {
      setBanner("Sign in to RSVP — create an account or log in first.");
      return;
    }
    setRsvpBusyId(eventId);
    setBanner(null);
    try {
      const res = await api.communityRsvp(eventId, token);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, spots: res.spots } : ev
        )
      );
      setBanner(res.message);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setBanner("Sign in to RSVP.");
      } else if (e instanceof ApiError && e.status === 403) {
        setBanner("This event requires a verified profile.");
      } else if (e instanceof ApiError && e.status === 422) {
        setBanner("That event is full.");
      } else {
        setBanner("RSVP failed — check your connection or try again.");
      }
    } finally {
      setRsvpBusyId(null);
    }
  }, []);

  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container max-w-5xl">
        <Badge tone="brand" className="bg-brand-50/80">
          <Users className="h-3 w-3" />
          Community
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Meet people, not just listings
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Inspired by platforms that blend housing with community — forums for honest
          advice and small local events so shared living feels less lonely.
        </p>

        {(loadError || banner) && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              loadError
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-brand-200 bg-brand-50 text-brand-900"
            }`}
          >
            {loadError && <p>{loadError}</p>}
            {banner && <p className={loadError ? "mt-2" : ""}>{banner}</p>}
          </div>
        )}

        {liveData && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-emerald-700">
            Connected to API
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Building2 className="h-5 w-5 text-brand-600" />
                Area & building guides
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Crowded, new vs old, overpriced, cleanliness, building maintenance, and main
                nationalities — from community reviews and ratings.
              </p>
            </div>
            <Link to="/community/areas">
              <Button variant="outline" size="sm">
                Browse all guides
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areaInsights.slice(0, 3).map((insight) => (
              <AreaInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <MessageCircle className="h-5 w-5 text-brand-600" />
                  Discussion forums
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setComposerOpen((o) => !o);
                    setBanner(null);
                  }}
                >
                  New topic
                </Button>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Ask locals, share hacks, and vet neighbourhoods before you move.
              </p>

              {composerOpen && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={newTitle}
                    onChange={(ev) => setNewTitle(ev.target.value)}
                    placeholder="e.g. Quiet buildings near Dubai Hills Mall?"
                    maxLength={200}
                  />
                  <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tag (optional)
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={newTag}
                    onChange={(ev) => setNewTag(ev.target.value)}
                    placeholder="Dubai, Sharjah, Budget…"
                    maxLength={64}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      type="button"
                      loading={topicSubmitting}
                      onClick={() => void submitTopic()}
                    >
                      Post topic
                    </Button>
                    {!getStoredAuthToken() && (
                      <Link to="/auth/login">
                        <Button size="sm" variant="ghost" type="button">
                          Sign in to post
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <ul className="mt-5 divide-y divide-slate-100">
                {topics.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 py-4 text-left transition hover:bg-slate-50/80 rounded-xl px-2 -mx-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 line-clamp-2">
                          {t.title}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <Badge tone="outline">{t.tag}</Badge>
                          <span>{t.replies} replies</span>
                          <span>·</span>
                          <span>{t.lastActivity}</span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Full threaded forums ship with Phase 2 — this preview shows how topics will
                surface by emirate and topic.
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-soft">
              <Sparkles className="h-6 w-6 text-accent-300" />
              <h3 className="mt-3 text-lg font-bold">Events near you</h3>
              <p className="mt-1 text-sm text-brand-100">
                Casual meetups — no spam, verified RSVPs only when we open bookings.
              </p>
              <ul className="mt-4 space-y-3">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold leading-snug">{e.title}</div>
                          {e.verifiedOnly ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-200">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-brand-200">
                          <Clock className="h-3 w-3" /> {e.date}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-brand-200">
                          <MapPin className="h-3 w-3" /> {e.spot}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-[11px] font-medium uppercase tracking-widest text-accent-200">
                            {e.spots} spots left
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            className="h-7 border-white/40 bg-white/10 text-[11px] text-white hover:bg-white/20"
                            disabled={rsvpBusyId === e.id || e.spots < 1}
                            onClick={() => void rsvp(e.id)}
                          >
                            {rsvpBusyId === e.id ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                RSVP…
                              </>
                            ) : (
                              "RSVP"
                            )}
                          </Button>
                          {!getStoredAuthToken() && (
                            <Link
                              to="/auth/login"
                              className="text-[11px] font-medium text-accent-200 underline-offset-2 hover:underline"
                            >
                              Sign in
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="mt-4 w-full bg-white text-brand-700 hover:bg-brand-50"
                type="button"
              >
                Notify me about events
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Coffee className="h-4 w-4 text-amber-600" />
                Host a meetup
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Verified hosts can propose neighbourhood coffees once Phase 2 launches.
              </p>
              <Link to="/post">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  List your space first
                </Button>
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">
            Looking for a roommate instead of scrolling forums alone?
          </p>
          <Link to="/match">
            <Button size="md" className="mt-3">
              Try AI matchmaking
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
