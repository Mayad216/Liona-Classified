import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Bookmark,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CopilotAutoApplyConsentPanel } from "@/components/copilot/CopilotAutoApplyConsentPanel";
import { CopilotJobAiPanel } from "@/components/copilot/CopilotJobAiPanel";
import { api } from "@/lib/api";
import { useCopilotAiUsage } from "@/lib/copilot/useCopilotAiUsage";
import { useCopilotAutoApply } from "@/lib/copilot/useCopilotAutoApply";
import { useCopilotBilling } from "@/lib/copilot/useCopilotBilling";
import { useCopilotMatches } from "@/lib/copilot/useCopilotMatches";
import type { CopilotCountry, CopilotJobMatch } from "@/types/copilot";

export function CopilotJobsPage() {
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<CopilotCountry[]>([]);
  const { items, loading, error, recalculating, recalculate, save, dismiss } =
    useCopilotMatches("recommended", country || undefined);
  const { usage, setUsage } = useCopilotAiUsage();
  const { billing } = useCopilotBilling();
  const { consent, queueingId, queueAutoApply } = useCopilotAutoApply();
  const [autoApplyError, setAutoApplyError] = useState<string | null>(null);
  const [autoApplySuccess, setAutoApplySuccess] = useState<string | null>(null);

  const canAutoApply = billing?.plan.auto_apply_enabled && billing?.usage.auto_apply.can_auto_apply;
  const hasConsent = consent?.has_consent;

  useEffect(() => {
    api.copilotCountries().then((res) => setCountries(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recommended jobs</h2>
          <p className="text-sm text-slate-500">
            Ranked by match score from your profile and default resume.
            {canAutoApply
              ? " Premium auto-apply is enabled."
              : " Free plan — apply manually or upgrade for auto-apply."}
          </p>
          {usage && (
            <p className="mt-1 text-xs text-brand-700">
              {usage.ai_credits_remaining} AI credits ·{" "}
              {billing?.usage.auto_apply.remaining ?? 0} auto-apps remaining
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            disabled={recalculating}
            onClick={() => recalculate(true)}
          >
          {recalculating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Recalculate matches
        </Button>
        </div>
      </div>

      {canAutoApply && !hasConsent && (
        <CopilotAutoApplyConsentPanel onGranted={() => setAutoApplySuccess(null)} />
      )}

      {autoApplyError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {autoApplyError}
        </div>
      )}
      {autoApplySuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {autoApplySuccess}{" "}
          <Link to="/jobs/copilot/applications" className="font-medium underline">
            View applications
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No matches yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Complete your profile and upload a resume, then recalculate matches.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/jobs/copilot/profile">
              <Button size="sm">Complete profile</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => recalculate(true)}>
              Recalculate
            </Button>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {items.map((match) => (
          <JobMatchCard
            key={match.id}
            match={match}
            onSave={save}
            onDismiss={dismiss}
            onUsageUpdate={setUsage}
            canAutoApply={!!canAutoApply && !!hasConsent}
            queueing={queueingId === match.id}
            onAutoApply={async () => {
              setAutoApplyError(null);
              setAutoApplySuccess(null);
              try {
                const app = await queueAutoApply(match.id);
                setAutoApplySuccess(
                  `Auto-apply queued for ${jobTitle(match)} (status: ${app.status}).`
                );
              } catch (e) {
                setAutoApplyError(e instanceof Error ? e.message : "Auto-apply failed");
              }
            }}
          />
        ))}
      </ul>

      {!canAutoApply && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 text-sm text-brand-900">
          <strong>Premium:</strong> upgrade for auto-apply, higher limits, and application tracking.
          <Link to="/jobs/copilot/pricing" className="ml-2 font-medium underline">
            View plans
          </Link>
        </div>
      )}
    </div>
  );
}

function jobTitle(match: CopilotJobMatch) {
  return match.job?.title ?? "this job";
}

function JobMatchCard({
  match,
  onSave,
  onDismiss,
  onUsageUpdate,
  canAutoApply,
  queueing,
  onAutoApply,
}: {
  match: CopilotJobMatch;
  onSave: (id: number) => void;
  onDismiss: (id: number) => void;
  onUsageUpdate?: (usage: import("@/types/copilot").CopilotAiUsage) => void;
  canAutoApply: boolean;
  queueing: boolean;
  onAutoApply: () => void;
}) {
  const job = match.job;
  if (!job) return null;

  const location =
    job.source === "platform"
      ? [job.emirate, job.area].filter(Boolean).join(" · ")
      : job.location;

  const applyHref =
    job.source === "platform" ? `/jobs/${job.id}` : job.apply_url ?? "#";

  const isExternal = job.source === "external";
  const minScore = 50;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{job.title}</h3>
            <Badge tone="brand">{Math.round(match.match_score)}% match</Badge>
            {match.scoring_method === "hybrid" && match.semantic_score != null && (
              <Badge tone="outline">AI {Math.round(match.semantic_score)}%</Badge>
            )}
            {job.source === "external" && <Badge tone="outline">External</Badge>}
            {job.country && <Badge tone="outline">{job.country}</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {job.company}
            {location ? ` · ${location}` : ""}
            {job.employment_type ? ` · ${job.employment_type}` : ""}
          </p>
          {(job.salary_min || job.salary_max) && (
            <p className="mt-1 text-xs text-slate-500">
              AED {job.salary_min?.toLocaleString() ?? "?"} –{" "}
              {job.salary_max?.toLocaleString() ?? "?"}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onSave(match.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700"
            title="Save job"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDismiss(match.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Dismiss"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {match.match_reason && (
        <p className="mt-3 text-sm text-slate-600">{match.match_reason}</p>
      )}

      {match.missing_skills.length > 0 && (
        <p className="mt-2 text-xs text-amber-700">
          Missing skills: {match.missing_skills.slice(0, 5).join(", ")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {canAutoApply && match.match_score >= minScore && (
          <Button size="sm" disabled={queueing} onClick={onAutoApply}>
            {queueing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Auto-apply
          </Button>
        )}
        {isExternal ? (
          <a href={applyHref} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4" />
              Apply manually
            </Button>
          </a>
        ) : (
          <Link to={applyHref}>
            <Button size="sm" variant="outline">
              Apply manually
            </Button>
          </Link>
        )}
        {!canAutoApply && (
          <Link to="/jobs/copilot/pricing">
            <Button size="sm" variant="outline">
              Upgrade to auto-apply
            </Button>
          </Link>
        )}
      </div>

      <CopilotJobAiPanel match={match} onUsageUpdate={onUsageUpdate} />
    </li>
  );
}
