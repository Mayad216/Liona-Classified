import { useState } from "react";
import { ArrowLeft, ArrowRight, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResumeJobTitleField } from "@/components/resume/ResumeJobTitleField";
import { ExperienceDescriptionSuggestions } from "@/components/resume/builder/ExperienceDescriptionSuggestions";
import { enhanceBullet } from "@/lib/resume/ai";
import {
  appendToDescription,
  bulletsToDescription,
  descriptionToBullets,
} from "@/lib/resume/experienceDescription";
import type { Experience } from "@/types/resume";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/15";

type Step = "details" | "description";

type Props = {
  exp: Experience;
  onChange: (exp: Experience) => void;
  onRemove: () => void;
};

function initialStep(exp: Experience): Step {
  const hasDescription = exp.bullets.some((b) => b.trim());
  return hasDescription && exp.job_title.trim() ? "description" : "details";
}

export function ExperienceEntryEditor({ exp, onChange, onRemove }: Props) {
  const [step, setStep] = useState<Step>(() => initialStep(exp));
  const descriptionText = bulletsToDescription(exp.bullets);

  const setDescriptionText = (text: string) => {
    onChange({ ...exp, bullets: descriptionToBullets(text) });
  };

  const appendSuggestion = (text: string) => {
    setDescriptionText(appendToDescription(descriptionText, text));
  };

  if (step === "details") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Step 1 of 2 · Job details</p>
          <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResumeJobTitleField
            value={exp.job_title}
            onChange={(job_title) => onChange({ ...exp, job_title })}
          />
          <Input
            label="Company"
            value={exp.company}
            onChange={(e) => onChange({ ...exp, company: e.target.value })}
          />
          <Input
            label="Location"
            value={exp.location}
            onChange={(e) => onChange({ ...exp, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start"
              placeholder="YYYY-MM"
              value={exp.start_date}
              onChange={(e) => onChange({ ...exp, start_date: e.target.value })}
            />
            <Input
              label="End"
              placeholder="YYYY-MM"
              value={exp.end_date}
              disabled={exp.is_current}
              onChange={(e) => onChange({ ...exp, end_date: e.target.value })}
            />
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={exp.is_current}
            onChange={(e) =>
              onChange({
                ...exp,
                is_current: e.target.checked,
                end_date: e.target.checked ? "" : exp.end_date,
              })
            }
          />
          I currently work here
        </label>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            disabled={!exp.job_title.trim()}
            onClick={() => setStep("description")}
            className="bg-[#00a67e] hover:bg-[#008f6b]"
          >
            Next — Add description
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-[#00a67e] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to job details
          </button>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Step 2 of 2 · Description</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {exp.job_title}
            {exp.company ? ` · ${exp.company}` : ""}
          </h3>
        </div>
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <ExperienceDescriptionSuggestions
          jobTitle={exp.job_title}
          company={exp.company}
          descriptionText={descriptionText}
          onAppend={appendSuggestion}
        />

        <div className="flex min-h-[280px] flex-col">
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor={`exp-desc-${exp.id}`} className="text-xs font-semibold text-slate-700">
              Job description
            </label>
            <button
              type="button"
              title="Improve with AI"
              disabled={!descriptionText.trim()}
              onClick={async () => {
                const improved = await enhanceBullet(descriptionText, exp.job_title);
                setDescriptionText(improved);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-[#00a67e] hover:bg-[#00a67e]/10 disabled:opacity-40"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Improve with AI
            </button>
          </div>
          <textarea
            id={`exp-desc-${exp.id}`}
            rows={14}
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            placeholder="Click suggestions on the left to add them here, then edit freely. Each paragraph becomes a bullet on your resume."
            className={`${fieldClass} min-h-[280px] flex-1 resize-y leading-relaxed`}
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Separate bullet points with a blank line. You can rewrite any suggestion after adding it.
          </p>
        </div>
      </div>
    </div>
  );
}
