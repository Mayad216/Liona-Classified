import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileUp, Loader2, Star, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotResumeSummary } from "@/types/copilot";

export function CopilotResumesPage() {
  const [items, setItems] = useState<CopilotResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.copilotResumes(token);
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleUpload = async (file: File) => {
    const token = getStoredAuthToken();
    if (!token) {
      setMessage("Sign in to upload resumes.");
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const res = await api.uploadCopilotResume(file, token);
      setMessage(res.message);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setDefault = async (id: string | number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.setDefaultCopilotResume(id, token);
    await refresh();
  };

  const retryParse = async (id: string | number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.parseCopilotResume(id, token);
    setMessage("Parsing queued.");
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <FileUp className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-3 font-semibold">Upload resume (PDF or TXT)</h2>
        <p className="mt-1 text-sm text-slate-500">
          We parse your file into structured data for matching. AI never invents missing details.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Choose file
          </Button>
          <Link to="/resume">
            <Button variant="outline">
              <Wand2 className="h-4 w-4" />
              Build in Resume Builder
            </Button>
          </Link>
        </div>
        {message && <p className="mt-3 text-sm text-brand-700">{message}</p>}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No resumes yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{r.title}</p>
                  {r.is_default && (
                    <Badge tone="brand">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                  <ParseBadge status={r.parse_status} />
                </div>
                <p className="text-xs text-slate-500">
                  {r.original_file_name ?? "Builder resume"}
                  {r.ats_score != null ? ` · ATS score ${r.ats_score}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!r.is_default && (
                  <Button size="sm" variant="outline" onClick={() => setDefault(r.id)}>
                    Set default
                  </Button>
                )}
                {r.parse_status === "failed" && (
                  <Button size="sm" variant="outline" onClick={() => retryParse(r.id)}>
                    Retry parse
                  </Button>
                )}
                <Link to={`/resume/${r.id}/edit`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ParseBadge({ status }: { status: CopilotResumeSummary["parse_status"] }) {
  const tones: Record<string, "default" | "brand" | "warning"> = {
    none: "default",
    pending: "warning",
    completed: "brand",
    failed: "warning",
  };
  return <Badge tone={tones[status] ?? "default"}>{status}</Badge>;
}
