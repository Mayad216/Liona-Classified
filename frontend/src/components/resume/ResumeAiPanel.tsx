import { useEffect, useState } from "react";
import { Loader2, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  aiGenerateSummary,
  aiSuggestKeywords,
  aiTailorResume,
} from "@/lib/resume/ai";
import { clearTailorContext, readTailorContext } from "@/lib/resume/plan";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

export function ResumeAiPanel({ data, onChange }: Props) {
  const [jobTitle, setJobTitle] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [tailorResult, setTailorResult] = useState<Awaited<
    ReturnType<typeof aiTailorResume>
  > | null>(null);
  const [keywords, setKeywords] = useState<{
    missing: string[];
    present: string[];
  } | null>(null);
  const [tailorJob, setTailorJob] = useState(readTailorContext());

  useEffect(() => {
    const ctx = readTailorContext();
    if (ctx) {
      setTailorJob(ctx);
      setJobTitle(ctx.title);
      setJobDescription(ctx.description);
    }
  }, []);

  useEffect(() => {
    if (!tailorJob || !jobDescription.trim()) return;
    if (new URLSearchParams(window.location.search).get("tailor") !== "1") return;

    const run = async () => {
      setLoading("tailor");
      try {
        const result = await aiTailorResume(data, jobDescription);
        setTailorResult(result);
        const kw = await aiSuggestKeywords(data, jobDescription);
        setKeywords({ missing: kw.missing_keywords, present: kw.already_present });
      } finally {
        setLoading(null);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when arriving from job page
  }, [tailorJob?.jobId]);

  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial });

  const runSummary = async () => {
    setLoading("summary");
    try {
      const summary = await aiGenerateSummary(jobTitle || "Professional", expNotes || data.summary);
      patch({ summary });
    } finally {
      setLoading(null);
    }
  };

  const runTailor = async () => {
    if (!jobDescription.trim()) return;
    setLoading("tailor");
    try {
      const result = await aiTailorResume(data, jobDescription);
      setTailorResult(result);
      const kw = await aiSuggestKeywords(data, jobDescription);
      setKeywords({ missing: kw.missing_keywords, present: kw.already_present });
    } finally {
      setLoading(null);
    }
  };

  const applyTailorSummary = () => {
    if (tailorResult?.summary_suggestion) {
      patch({ summary: tailorResult.summary_suggestion });
    }
  };

  return (
    <section className="rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50/80 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-800">
          AI assistant
        </h2>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Rewrites your real experience — never invents employers or dates. Works offline with
        smart fallbacks when the API is unavailable.
      </p>

      {tailorJob && (
        <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50/80 p-3 text-xs text-brand-900">
          <span>
            <strong>Tailoring for:</strong> {tailorJob.title} at {tailorJob.company}
          </span>
          <button
            type="button"
            onClick={() => {
              clearTailorContext();
              setTailorJob(null);
            }}
            className="text-brand-600 hover:text-brand-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700">Generate professional summary</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input
              label="Target job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Leasing Consultant"
            />
            <Input
              label="Experience notes"
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              placeholder="Brief background…"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            disabled={loading === "summary"}
            onClick={runSummary}
          >
            {loading === "summary" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Generate summary
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700">Tailor to job description</p>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste a job description from Khaleej Jobs…"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={loading === "tailor" || !jobDescription.trim()}
            onClick={runTailor}
          >
            {loading === "tailor" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyze & suggest
          </Button>

          {tailorResult && (
            <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
              {tailorResult.summary_suggestion && (
                <div>
                  <p className="font-semibold">Suggested summary</p>
                  <p className="mt-1">{tailorResult.summary_suggestion}</p>
                  <button
                    type="button"
                    onClick={applyTailorSummary}
                    className="mt-1 text-brand-700 hover:underline"
                  >
                    Apply to resume
                  </button>
                </div>
              )}
              {tailorResult.missing_keywords.length > 0 && (
                <p>
                  <span className="font-semibold">Keywords to weave in: </span>
                  {tailorResult.missing_keywords.join(", ")}
                </p>
              )}
            </div>
          )}

          {keywords && keywords.missing.length > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              Missing from resume: {keywords.missing.slice(0, 8).join(", ")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}