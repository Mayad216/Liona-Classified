import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotAdminMonitoring } from "@/types/copilot";

export function CopilotAdminPage() {
  const [data, setData] = useState<CopilotAdminMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapingId, setScrapingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.adminCopilotMonitoring(token);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const scrape = async (sourceId: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    setScrapingId(sourceId);
    try {
      await api.adminScrapeJobSource(sourceId, token, true);
      await refresh();
    } finally {
      setScrapingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-600">Could not load monitoring data.</p>;
  }

  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Copilot admin monitoring</h2>
          <p className="text-sm text-slate-500">
            Job sources, scrape runs, embeddings coverage, and platform activity.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active jobs" value={String(totals.copilot_jobs)} />
        <Stat label="Job sources" value={String(totals.job_sources)} sub={`${totals.active_sources} scraping`} />
        <Stat label="Premium users" value={String(totals.premium_users)} />
        <Stat label="Apps (24h)" value={String(totals.applications_24h)} />
        <Stat label="Matches" value={String(totals.matches_total)} />
        <Stat label="Embedding coverage" value={`${totals.embedding_coverage_pct}%`} />
        <Stat label="Auto-apps today" value={String(data.ai_usage_today)} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Jobs by country</h3>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {Object.entries(data.jobs_by_country).map(([code, count]) => (
            <li key={code} className="rounded-lg bg-slate-100 px-3 py-1">
              {code}: {count}
            </li>
          ))}
          {Object.keys(data.jobs_by_country).length === 0 && (
            <li className="text-slate-500">No external jobs yet — run a scrape.</li>
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Job sources</h3>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {(data.sources as Array<{ id: number; name: string; country?: string; status: string; scraping_enabled: boolean; last_scrape_status?: string }>).map((source) => (
            <li key={source.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{source.name}</p>
                <p className="text-slate-500">
                  {source.country ?? "UAE"} · {source.status}
                  {source.last_scrape_status && ` · last: ${source.last_scrape_status}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {source.scraping_enabled && <Badge tone="brand">Scraping</Badge>}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={scrapingId === source.id}
                  onClick={() => scrape(source.id)}
                >
                  {scrapingId === source.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Scrape now
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Recent scrape runs</h3>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {data.recent_scrape_runs.length === 0 && (
            <li className="py-3 text-slate-500">No scrape runs yet.</li>
          )}
          {data.recent_scrape_runs.map((run) => (
            <li key={run.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{run.source ?? "Source"}</span>
                <Badge tone={run.status === "completed" ? "success" : run.status === "failed" ? "danger" : "default"}>
                  {run.status}
                </Badge>
              </div>
              <p className="text-slate-500">
                found {run.jobs_found} · imported {run.jobs_imported} · updated {run.jobs_updated}
                {run.error_message && ` · ${run.error_message}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
