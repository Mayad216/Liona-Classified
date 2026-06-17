import { useMemo } from "react";
import { CheckCircle2, AlertCircle, MinusCircle, ShieldAlert } from "lucide-react";
import type { CategoryAggregateScore, DimensionScore } from "@/lib/matchmaking/types";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/matchmaking/config";
import { Badge } from "@/components/ui/Badge";

interface Props {
  breakdown: DimensionScore[];
  categoryScores: CategoryAggregateScore[];
}

export function MatchScoreBreakdown({ breakdown, categoryScores }: Props) {
  const grouped = useMemo(() => {
    const by: Record<string, DimensionScore[]> = {};
    for (const d of breakdown) {
      (by[d.category] = by[d.category] ?? []).push(d);
    }
    return by;
  }, [breakdown]);

  const categoryMeta = useMemo(() => {
    return Object.fromEntries(categoryScores.map((c) => [c.key, c])) as Record<
      string,
      CategoryAggregateScore
    >;
  }, [categoryScores]);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, dims]) => {
        const meta =
          CATEGORIES[cat as keyof typeof CATEGORIES] ??
          ({ label: cat, icon: "•" } as const);
        const aggregate = categoryMeta[cat];

        return (
          <div key={cat}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span aria-hidden>{meta.icon}</span>
                {meta.label}
              </h3>
              {aggregate?.openMatch ? (
                <Badge tone="success" className="bg-emerald-50 text-emerald-700">
                  Match
                </Badge>
              ) : aggregate ? (
                <span className="text-xs font-semibold tabular-nums text-slate-700">
                  {Math.round(aggregate.value * 100)}%
                </span>
              ) : null}
            </div>
            <ul className="space-y-2">
              {dims.map((d) => (
                <DimensionRow key={d.key} dim={d} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DimensionRow({ dim }: { dim: DimensionScore }) {
  const isOpenMatch = dim.openMatch === true;
  const tone = !dim.contributed
    ? "muted"
    : isOpenMatch || dim.score >= 0.75
      ? "good"
      : dim.score >= 0.45
        ? "fair"
        : "poor";

  const Icon =
    tone === "good" ? CheckCircle2 : tone === "poor" ? AlertCircle : MinusCircle;

  const toneClasses = {
    good: "text-emerald-600 bg-emerald-50",
    fair: "text-amber-600 bg-amber-50",
    poor: "text-red-600 bg-red-50",
    muted: "text-slate-400 bg-slate-50",
  }[tone];

  const barColor = {
    good: "bg-emerald-500",
    fair: "bg-amber-500",
    poor: "bg-red-400",
    muted: "bg-slate-300",
  }[tone];

  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <span
        className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg", toneClasses)}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            {dim.label}
            {isOpenMatch && (
              <Badge tone="success" className="bg-emerald-50 px-1.5 py-0 text-[9px]">
                Match
              </Badge>
            )}
            {dim.isDealbreaker && (
              <span
                className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700"
                title="Your deal-breaker"
              >
                <ShieldAlert className="h-2.5 w-2.5" />
                Must match
              </span>
            )}
          </span>
          <span className="text-xs font-semibold tabular-nums text-slate-700">
            {isOpenMatch ? "Match" : `${Math.round(dim.score * 100)}%`}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{dim.explanation}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${Math.round(dim.score * 100)}%` }}
          />
        </div>
      </div>
    </li>
  );
}
