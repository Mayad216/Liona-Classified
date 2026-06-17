import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Briefcase, ShieldAlert } from "lucide-react";
import { MatchProfileOverview } from "@/components/match/ProfileBasicsFields";
import type { MatchResult } from "@/lib/matchmaking/types";
import { badgeForScore } from "@/lib/matchmaking/engine";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Props {
  match: MatchResult;
  /** Tighter layout for the search results grid. */
  dense?: boolean;
}

const badgeMeta = {
  great: { label: "Great match", className: "bg-emerald-500 text-white" },
  good: { label: "Good match", className: "bg-amber-500 text-white" },
  fair: { label: "Fair match", className: "bg-slate-400 text-white" },
  poor: { label: "Low match", className: "bg-red-400 text-white" },
};

export function MatchCard({ match, dense = false }: Props) {
  const tone = badgeForScore(match.score);
  const meta = badgeMeta[tone];

  return (
    <Link
      to={`/match/${match.candidate.userId}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
        dense ? "p-3.5" : "rounded-2xl p-5",
        match.dealbreakerClash
          ? "border-amber-300 ring-1 ring-amber-200/80"
          : "border-slate-200/70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            src={match.candidate.avatar}
            name={match.candidate.name}
            size={dense ? "md" : "lg"}
            ring
          />
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-bold text-slate-900 group-hover:text-brand-700",
                dense ? "text-sm" : "text-base"
              )}
            >
              {match.candidate.name}
            </h3>
            {dense && match.candidate.occupation && (
              <p className="truncate text-[11px] text-slate-500">
                {match.candidate.occupation}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full font-bold uppercase tracking-widest",
              dense ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[10px]",
              meta.className
            )}
          >
            {dense ? meta.label.replace(" match", "") : meta.label}
          </div>
          <div
            className={cn(
              "mt-0.5 font-black tabular-nums tracking-tight text-slate-900",
              dense ? "text-xl" : "text-3xl"
            )}
          >
            {match.score}
            <span className="ml-0.5 text-xs font-semibold text-slate-400">%</span>
          </div>
        </div>
      </div>

      {match.dealbreakerClash && match.dealbreakerWarnings && (
        <div
          className={cn(
            "rounded-lg border border-amber-200 bg-amber-50/80",
            dense ? "mt-2 px-2 py-1.5" : "mt-3 rounded-xl px-3 py-2.5"
          )}
        >
          <p className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-800">
            <ShieldAlert className="h-2.5 w-2.5" />
            Clash · {match.score}%+
          </p>
          {!dense && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-amber-900/90">
              {match.dealbreakerWarnings.map((w) => (
                <li key={w} className="line-clamp-2">
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        className={cn(
          "rounded-lg border border-slate-100 bg-slate-50/80",
          dense ? "mt-2.5 p-2" : "mt-4 rounded-xl p-3"
        )}
      >
        <MatchProfileOverview
          profile={match.candidate}
          compact
          factColumns={dense ? 2 : 1}
          title=""
        />
      </div>

      {match.highlights.length > 0 && (
        <div className={dense ? "mt-2" : "mt-4"}>
          {!dense && (
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
              <Sparkles className="h-3 w-3" />
              Why you&apos;ll click
            </div>
          )}
          <div className={cn("flex flex-wrap gap-1", !dense && "mt-2 gap-1.5")}>
            {match.highlights.slice(0, dense ? 2 : undefined).map((h) => (
              <Badge
                key={h.key}
                tone="success"
                className={cn("bg-emerald-50", dense && "px-1.5 py-0 text-[10px]")}
              >
                {h.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {match.concerns.length > 0 && !dense && (
        <div className="mt-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
            Heads-up
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {match.concerns.slice(0, 2).map((c) => (
              <Badge key={c.key} tone="warning">
                {c.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-auto flex items-center justify-between border-t border-slate-100",
          dense ? "mt-2.5 pt-2" : "mt-5 pt-4"
        )}
      >
        {match.candidate.listingId ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700">
            <Briefcase className="h-3 w-3" /> Listing
          </span>
        ) : (
          <span className="text-[10px] text-slate-500">Seeking</span>
        )}
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand-700">
          View
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
