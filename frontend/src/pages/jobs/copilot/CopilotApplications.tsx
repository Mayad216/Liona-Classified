import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ChevronUp, ExternalLink, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, getApiBaseUrl, getStoredAuthToken } from "@/lib/api";
import type { CopilotApplication, CopilotAutomationLogEntry } from "@/types/copilot";

const STATUS_TONE: Record<string, "success" | "warning" | "default" | "outline"> = {
  submitted: "success",
  needs_review: "warning",
  running: "default",
  queued: "outline",
  failed: "default",
};

export function CopilotApplicationsPage() {
  const [items, setItems] = useState<CopilotApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, CopilotAutomationLogEntry[]>>({});
  const [logsLoading, setLogsLoading] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.copilotApplications(token);
      const paginated = res as { data?: CopilotApplication[] };
      setItems(paginated.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadLogs = async (id: number) => {
    if (logs[id]) {
      setExpandedId(expandedId === id ? null : id);
      return;
    }
    const token = getStoredAuthToken();
    if (!token) return;
    setLogsLoading(id);
    try {
      const res = await api.copilotAutoApplicationLogs(id, token);
      setLogs((prev) => ({ ...prev, [id]: res.data }));
      setExpandedId(id);
    } finally {
      setLogsLoading(null);
    }
  };

  const approve = async (id: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await api.copilotApproveApplication(id, token);
      await refresh();
    } finally {
      setActionLoading(null);
    }
  };

  const cancel = async (id: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await api.copilotCancelApplication(id, token);
      await refresh();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
          <p className="text-sm text-slate-500">
            Track auto-applied jobs, review queue, confidence scores, and automation logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs/copilot/settings">
            <Button size="sm" variant="outline">
              Automation settings
            </Button>
          </Link>
          <Link to="/jobs/copilot/jobs">
            <Button size="sm" variant="outline">
              Browse jobs
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">No applications yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Use auto-apply on recommended jobs or apply manually.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((app) => (
          <li key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {app.job?.title ?? "Job application"}
                  </h3>
                  <Badge tone={STATUS_TONE[app.status] ?? "outline"}>
                    {app.status.replace(/_/g, " ")}
                  </Badge>
                  {app.application_type === "auto" && <Badge tone="brand">Auto</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {app.job?.company}
                  {app.confidence_score != null && (
                    <span className="text-slate-400">
                      {" "}
                      · confidence {(app.confidence_score * 100).toFixed(0)}%
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(app.submitted_at ?? app.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.status === "needs_review" && (
                  <>
                    <Button
                      size="sm"
                      disabled={actionLoading === app.id}
                      onClick={() => approve(app.id)}
                    >
                      {actionLoading === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading === app.id}
                      onClick={() => cancel(app.id)}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
                {app.apply_url && (
                  <a href={app.apply_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                      View job
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={logsLoading === app.id}
                  onClick={() => loadLogs(app.id)}
                >
                  {logsLoading === app.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : expandedId === app.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Logs
                </Button>
              </div>
            </div>

            {app.confidence_breakdown && (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-medium text-slate-700">Confidence breakdown</p>
                <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                  {Object.entries(app.confidence_breakdown).map(([key, factor]) => (
                    <li key={key}>
                      {factor.label}: {(factor.score * 100).toFixed(0)}% (weight{" "}
                      {(factor.weight * 100).toFixed(0)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {app.detected_screening && app.detected_screening.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Detected screening: {app.detected_screening.slice(0, 2).map((q) => q.text).join(" · ")}
              </p>
            )}

            {app.status === "needs_review" && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                This application needs your review before it can be finalized.
                {(app.metadata as { needs_review_reason?: string } | null)?.needs_review_reason &&
                  ` ${(app.metadata as { needs_review_reason?: string }).needs_review_reason}`}
              </p>
            )}

            {app.error_message && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {app.error_message}
              </p>
            )}

            {expandedId === app.id && logs[app.id] && (
              <LogList logs={logs[app.id]} applicationId={app.id} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LogList({ logs, applicationId }: { logs: CopilotAutomationLogEntry[]; applicationId: number }) {
  return (
    <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 text-sm">
      {logs.map((log) => (
        <li key={log.id} className="px-3 py-2">
          <span className="font-medium text-slate-700">{log.step}</span>
          <span className="text-slate-400"> · {log.level}</span>
          <p className="text-slate-600">{log.message}</p>
          {log.screenshot_path && (
            <ScreenshotThumb applicationId={applicationId} path={log.screenshot_path} />
          )}
        </li>
      ))}
    </ul>
  );
}

function ScreenshotThumb({ applicationId, path }: { applicationId: number; path: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;
    const encoded = btoa(path);
    const url = `${getApiBaseUrl()}/copilot/auto-apply/applications/${applicationId}/screenshots/${encoded}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "image/png" } })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob) setSrc(URL.createObjectURL(blob));
      });
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, path]);

  if (!src) return <p className="mt-1 text-xs text-slate-400">Loading screenshot…</p>;

  return (
    <img
      src={src}
      alt="Automation screenshot"
      className="mt-2 max-h-40 rounded border border-slate-200"
    />
  );
}
