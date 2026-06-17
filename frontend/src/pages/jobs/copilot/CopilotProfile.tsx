import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useJobSeekerProfile } from "@/lib/copilot/useJobSeekerProfile";
import type { RemotePreference, ScreeningAnswer } from "@/types/copilot";

export function CopilotProfilePage() {
  const { profile, screeningQuestions, screeningAnswers, loading, saving, save } =
    useJobSeekerProfile();
  const [draft, setDraft] = useState(profile);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(profile);
    const map: Record<string, string> = {};
    screeningAnswers.forEach((a) => {
      map[a.question_key] = a.answer_text;
    });
    setAnswers(map);
  }, [profile, screeningAnswers]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const update = (key: keyof typeof draft, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const screeningPayload: ScreeningAnswer[] = screeningQuestions.map((q) => ({
      question_key: q.key,
      question_text: q.text,
      answer_text: answers[q.key] ?? "",
      answer_type: q.type,
    }));

    await save(draft, screeningPayload);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Personal information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={draft.full_name ?? ""}
              onChange={(e) => update("full_name", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={draft.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Location">
            <Input
              value={draft.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
            />
          </Field>
          <Field label="Country">
            <Input
              value={draft.country ?? "UAE"}
              onChange={(e) => update("country", e.target.value)}
            />
          </Field>
          <Field label="LinkedIn URL">
            <Input
              value={draft.linkedin_url ?? ""}
              onChange={(e) => update("linkedin_url", e.target.value)}
            />
          </Field>
          <Field label="Portfolio URL">
            <Input
              value={draft.portfolio_url ?? ""}
              onChange={(e) => update("portfolio_url", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Job preferences</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Current job title">
            <Input
              value={draft.current_job_title ?? ""}
              onChange={(e) => update("current_job_title", e.target.value)}
            />
          </Field>
          <Field label="Years of experience">
            <Input
              type="number"
              min={0}
              value={draft.years_of_experience ?? ""}
              onChange={(e) =>
                update("years_of_experience", e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
          <Field label="Target job titles (comma-separated)" className="sm:col-span-2">
            <Input
              value={(draft.target_job_titles ?? []).join(", ")}
              onChange={(e) =>
                update(
                  "target_job_titles",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </Field>
          <Field label="Preferred locations (comma-separated)" className="sm:col-span-2">
            <Input
              placeholder="Dubai, Abu Dhabi, Sharjah"
              value={(draft.preferred_locations ?? []).join(", ")}
              onChange={(e) =>
                update(
                  "preferred_locations",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </Field>
          <Field label="Remote preference">
            <select
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={draft.remote_preference ?? "any"}
              onChange={(e) => update("remote_preference", e.target.value as RemotePreference)}
            >
              <option value="any">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </Field>
          <Field label="Work authorization">
            <Input
              placeholder="e.g. UAE residence visa, citizen"
              value={draft.work_authorization ?? ""}
              onChange={(e) => update("work_authorization", e.target.value)}
            />
          </Field>
          <Field label="Expected salary min (AED)">
            <Input
              type="number"
              value={draft.expected_salary_min ?? ""}
              onChange={(e) =>
                update("expected_salary_min", e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
          <Field label="Expected salary max (AED)">
            <Input
              type="number"
              value={draft.expected_salary_max ?? ""}
              onChange={(e) =>
                update("expected_salary_max", e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.requires_visa_sponsorship ?? false}
              onChange={(e) => update("requires_visa_sponsorship", e.target.checked)}
            />
            I require visa sponsorship
          </label>
        </div>
        <Field label="Professional summary" className="mt-4">
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm"
            value={draft.professional_summary ?? ""}
            onChange={(e) => update("professional_summary", e.target.value)}
          />
        </Field>
      </div>

      {screeningQuestions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Screening answers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Save once — reuse for future applications (Premium auto-apply uses these).
          </p>
          <div className="mt-4 space-y-4">
            {screeningQuestions.map((q) => (
              <Field key={q.key} label={q.text}>
                <Input
                  value={answers[q.key] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
