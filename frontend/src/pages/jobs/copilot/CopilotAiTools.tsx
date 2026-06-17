import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCopilotAiUsage } from "@/lib/copilot/useCopilotAiUsage";
import {
  copilotGenerateSummary,
  copilotImproveBullet,
  copilotScreeningAnswer,
} from "@/lib/copilot/ai";

export function CopilotAiToolsPage() {
  const { usage, refresh, setUsage } = useCopilotAiUsage();
  const [targetRole, setTargetRole] = useState("");
  const [summary, setSummary] = useState("");
  const [bullet, setBullet] = useState("");
  const [bulletVersions, setBulletVersions] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [screeningAnswer, setScreeningAnswer] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (key: string, fn: () => Promise<{ data: Record<string, unknown> }>) => {
    setLoading(key);
    setError(null);
    try {
      const res = await fn();
      if (res.data.usage) setUsage(res.data.usage as import("@/types/copilot").CopilotAiUsage);
      return res.data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return null;
    } finally {
      setLoading(null);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI application tools</h2>
          <p className="text-sm text-slate-500">
            Uses your profile and default resume only — never fabricates credentials.
          </p>
        </div>
        {usage && (
          <p className="text-sm text-slate-600">
            <Sparkles className="mr-1 inline h-4 w-4 text-brand-600" />
            {usage.ai_credits_remaining} / {usage.ai_credits_limit} AI credits left this month
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Professional summary</h3>
        <p className="mt-1 text-sm text-slate-500">Generate a summary from your Copilot profile and resume.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Target role (optional)"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="max-w-xs"
          />
          <Button
            size="sm"
            disabled={loading === "summary"}
            onClick={async () => {
              const data = await handle("summary", () =>
                copilotGenerateSummary(targetRole || undefined)
              );
              if (data?.summary) setSummary(data.summary as string);
            }}
          >
            {loading === "summary" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generate
          </Button>
        </div>
        {summary && (
          <textarea
            readOnly
            className="mt-3 min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm"
            value={summary}
          />
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Bullet enhancer</h3>
        <p className="mt-1 text-sm text-slate-500">Get 3 truthful rewrites of a resume bullet.</p>
        <textarea
          className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-200 p-3 text-sm"
          placeholder="Paste a resume bullet..."
          value={bullet}
          onChange={(e) => setBullet(e.target.value)}
        />
        <Button
          className="mt-2"
          size="sm"
          disabled={!bullet.trim() || loading === "bullet"}
          onClick={async () => {
            const data = await handle("bullet", () => copilotImproveBullet(bullet));
            if (data?.versions) setBulletVersions(data.versions as string[]);
          }}
        >
          {loading === "bullet" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Improve bullet
        </Button>
        {bulletVersions.length > 0 && (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {bulletVersions.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Screening answer</h3>
        <p className="mt-1 text-sm text-slate-500">
          Answers from your profile only. Returns NEEDS_USER_REVIEW when data is missing.
        </p>
        <Input
          className="mt-3"
          placeholder="e.g. Are you legally authorized to work in the UAE?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button
          className="mt-2"
          size="sm"
          disabled={!question.trim() || loading === "screening"}
          onClick={async () => {
            const data = await handle("screening", () => copilotScreeningAnswer(question));
            if (data?.answer) setScreeningAnswer(data.answer as string);
          }}
        >
          {loading === "screening" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generate answer
        </Button>
        {screeningAnswer && (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{screeningAnswer}</p>
        )}
      </section>
    </div>
  );
}
