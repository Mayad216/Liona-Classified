import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { aiGenerateSummaryFromResume } from "@/lib/resume/ai";
import { hasEnoughForSummary } from "@/lib/resume/summaryContext";
import type { ResumeData } from "@/types/resume";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/15";

type Props = {
  data: ResumeData;
  summary: string;
  onChange: (summary: string) => void;
};

export function ProfessionalSummaryEditor({ data, summary, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const autoAttempted = useRef(false);
  const canGenerate = hasEnoughForSummary(data);

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const text = await aiGenerateSummaryFromResume(data);
      onChange(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoAttempted.current || summary.trim() || !canGenerate) return;
    autoAttempted.current = true;
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-generate once on first visit
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#00a67e]/25 bg-gradient-to-br from-[#00a67e]/8 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a67e]/15">
            <Sparkles className="h-5 w-5 text-[#00a67e]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Final step — Professional summary</p>
            <p className="mt-1 text-sm text-slate-600">
              We generate a summary from your work history, education, skills, and other sections.
              Review the draft below and edit it until it sounds like you.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || !canGenerate}
            onClick={() => void generate()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {summary.trim() ? "Regenerate summary" : "Generate summary"}
          </Button>
        </div>

        {!canGenerate && (
          <p className="mt-3 text-xs text-amber-700">
            Add work history, education, or skills first so we can build your summary.
          </p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="professional-summary" className="mb-1 block text-xs font-semibold text-slate-700">
          Your professional summary
        </label>
        {loading && !summary.trim() && (
          <div className="absolute inset-0 top-6 z-10 flex items-center justify-center rounded-lg bg-white/80">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-[#00a67e]" />
              Writing your summary from your CV…
            </div>
          </div>
        )}
        <textarea
          id="professional-summary"
          rows={8}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            canGenerate
              ? "Your AI-generated summary will appear here. You can edit every word."
              : "Complete other sections first, then return here to generate your summary."
          }
          className={fieldClass}
        />
        <p className="mt-2 text-[11px] text-slate-400">
          Tip: Keep it to 3–4 sentences. Recruiters often read this first.
        </p>
      </div>
    </div>
  );
}
