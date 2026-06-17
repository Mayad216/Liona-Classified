import { Link } from "react-router-dom";
import {
  BellRing,
  BellOff,
  Trash2,
  ArrowRight,
  Search as SearchIcon,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSavedSearches } from "@/components/SaveSearchButton";
import { relativeTime } from "@/lib/utils";

export function SavedSearches() {
  const { items, upsert, remove } = useSavedSearches();

  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container max-w-4xl">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <BellRing className="h-3.5 w-3.5" />
            Saved searches
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Get pinged the moment a listing matches.
          </h1>
          <p className="mt-2 text-slate-600">
            Save any filtered search and we'll email + push you within minutes of new
            results being posted.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <SearchIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-lg font-bold">No saved searches yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Apply filters on the accommodation page, then click <b>Save & alert</b>.
            </p>
            <Link to="/accommodation">
              <Button size="lg" className="mt-6">
                Browse listings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {items.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold">{s.name}</h3>
                    {s.newResults > 0 && (
                      <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold text-accent-700">
                        {s.newResults} new
                      </span>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {s.query || "All listings"}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    <CalendarClock className="h-3 w-3" />
                    Saved {relativeTime(s.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      upsert({ ...s, alertsEnabled: !s.alertsEnabled })
                    }
                    title={s.alertsEnabled ? "Mute alerts" : "Enable alerts"}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                      s.alertsEnabled
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {s.alertsEnabled ? (
                      <BellRing className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>
                  <Link to={s.url}>
                    <Button variant="outline" size="sm">
                      View <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => remove(s.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
