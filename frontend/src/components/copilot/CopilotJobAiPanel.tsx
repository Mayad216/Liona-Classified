import { useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  copilotExplainMatch,
  copilotExtractKeywords,
  copilotGenerateCoverLetter,
  copilotTailorResume,
} from "@/lib/copilot/ai";
import type { CopilotJobMatch } from "@/types/copilot";
import type { CopilotAiUsage } from "@/types/copilot";

type Props = {
  match: CopilotJobMatch;
  onUsageUpdate?: (usage: CopilotAiUsage) => void;
};

export function CopilotJobAiPanel({ match, onUsageUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<{ missing: string[]; present: string[] } | null>(null);
  const [tailorSummary, setTailorSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: string, fn: () => Promise<{ data: unknown }>) => {
    setLoading(action);
    setError(null);
    try {
      const res = await fn();
      const data = res.data as Record<string, unknown> & { usage?: CopilotAiUsage };
      const usage = data.usage;
      if (usage && onUsageUpdate) onUsageUpdate(usage);

      if (action === "cover") setCoverLetter(data.cover_letter as string);
      if (action === "keywords") {
        setKeywords({
          missing: (data.missing_keywords as string[]) ?? [],
          present: (data.already_present as string[]) ?? [],
        });
      }
      if (action === "tailor") setTailorSummary((data.tailored_summary as string) ?? null);
      if (action === "explain") {
        const rec = data.recommendation as string;
        setExplanation(
          `${data.match_reason as string}${rec ? ` Recommendation: ${rec}.` : ""}`
        );
      }
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(null);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => run("cover", () => copilotGenerateCoverLetter(match.id))}
        >
          {loading === "cover" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Cover letter
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => run("keywords", () => copilotExtractKeywords(match.id))}
        >
          {loading === "keywords" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Keywords
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => run("tailor", () => copilotTailorResume(match.id))}
        >
          {loading === "tailor" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Tailor resume
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => run("explain", () => copilotExplainMatch(match.id))}
        >
          {loading === "explain" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Explain match
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {open && (coverLetter || keywords || tailorSummary || explanation) && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {coverLetter && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Cover letter
                </span>
                <button type="button" onClick={() => copy(coverLetter)} className="text-slate-400 hover:text-brand-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="whitespace-pre-wrap">{coverLetter}</p>
            </div>
          )}
          {keywords && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Keywords</p>
              <p className="mt-1">
                <Badge tone="success">Present</Badge>{" "}
                {keywords.present.slice(0, 8).join(", ") || "—"}
              </p>
              <p className="mt-1">
                <Badge tone="warning">Missing</Badge>{" "}
                {keywords.missing.slice(0, 8).join(", ") || "—"}
              </p>
            </div>
          )}
          {tailorSummary && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Tailored summary suggestion
              </p>
              <p className="mt-1">{tailorSummary}</p>
            </div>
          )}
          {explanation && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI match insight</p>
              <p className="mt-1">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
