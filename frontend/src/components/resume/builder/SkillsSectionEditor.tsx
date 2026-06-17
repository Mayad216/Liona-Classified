import { useMemo, useState } from "react";
import { Loader2, Plus, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getGeneralSkillSuggestions,
  hasSkill,
  isCatalogJobTitle,
  mergeSkills,
  removeSkill,
  type SkillSuggestion,
} from "@/lib/resume/skillSuggestions";
import { useExperienceSkillSuggestions } from "@/lib/resume/useExperienceSkillSuggestions";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  skills: string[];
  onChange: (skills: string[]) => void;
};

function SuggestionChip({
  item,
  onAdd,
}: {
  item: SkillSuggestion;
  onAdd: (skill: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAdd(item.skill)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-[#00a67e]/50 hover:bg-[#00a67e]/5",
        item.recommended
          ? "border-amber-200 bg-amber-50/80 text-amber-900"
          : "border-slate-200 bg-white text-slate-700"
      )}
    >
      <Plus className="h-3 w-3 shrink-0" />
      {item.skill}
      {item.recommended && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
      {item.fromAi && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#00a67e]">
          <Sparkles className="h-3 w-3" />
          AI
        </span>
      )}
    </button>
  );
}

export function SkillsSectionEditor({ data, skills, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const { suggestions: experienceSuggestions, groups: experienceGroups, aiLoading, aiActive } =
    useExperienceSkillSuggestions(data.experiences, skills);

  const generalSuggestions = useMemo(
    () => getGeneralSkillSuggestions(skills).slice(0, 24),
    [skills]
  );

  const hasWorkHistory = data.experiences.some((exp) => exp.job_title.trim());
  const hasCustomTitles = data.experiences.some(
    (exp) => exp.job_title.trim() && !isCatalogJobTitle(exp.job_title)
  );

  function addSkill(skill: string) {
    onChange(mergeSkills(skills, [skill]));
  }

  function addMany(next: string[]) {
    onChange(mergeSkills(skills, next));
  }

  function addCustomSkill() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addSkill(trimmed);
    setDraft("");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#00a67e]/25 bg-gradient-to-br from-[#00a67e]/8 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a67e]/15">
            <Sparkles className="h-5 w-5 text-[#00a67e]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Automated skill suggestions</p>
            <p className="mt-1 text-sm text-slate-600">
              Click suggested skills to add them instantly. We match common skills to your roles and
              use AI for custom job titles not in our catalog.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700">Your skills</label>
        {skills.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No skills added yet — pick suggestions below or type your own.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full border border-[#00a67e]/30 bg-[#00a67e]/10 px-3 py-1.5 text-xs font-medium text-slate-800"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => onChange(removeSkill(skills, skill))}
                  className="rounded-full p-0.5 text-slate-500 hover:bg-white hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700">Add custom skill</label>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="e.g. Negotiation, SAP, Arabic"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/15"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomSkill}
            disabled={!draft.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      {hasWorkHistory && (
        <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Based on your work history</p>
              <p className="text-xs text-slate-500">
                Skills matched to your job titles
                {aiActive ? " — including AI suggestions for custom roles" : ""}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {aiLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00a67e]" />
                  AI suggesting…
                </span>
              )}
              {experienceSuggestions.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addMany(experienceSuggestions.map((item) => item.skill))
                  }
                >
                  Add all ({experienceSuggestions.length})
                </Button>
              )}
            </div>
          </div>

          {experienceGroups.length === 0 && !aiLoading ? (
            <p className="text-sm text-slate-500">
              All work-history suggestions are already on your list.
            </p>
          ) : (
            <div className="space-y-4">
              {experienceGroups.map((group) => (
                <div key={group.jobTitle}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
                    {group.jobTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((item) => (
                      <SuggestionChip key={`${group.jobTitle}-${item.skill}`} item={item} onAdd={addSkill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasWorkHistory && (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Add work experience with job titles to unlock tailored skill suggestions for each role.
          Custom titles get AI-powered skill recommendations automatically.
        </p>
      )}

      {hasWorkHistory && hasCustomTitles && !aiLoading && aiActive && (
        <p className="text-xs text-emerald-700">
          AI skill suggestions are shown for roles not in our standard job title list.
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Popular general skills</p>
            <p className="text-xs text-slate-500">
              Soft skills and tools commonly listed on professional resumes.
            </p>
          </div>
          {generalSuggestions.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addMany(generalSuggestions.map((item) => item.skill))}
            >
              Add all ({generalSuggestions.length})
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {generalSuggestions.map((item) => (
            <SuggestionChip key={item.skill} item={item} onAdd={addSkill} />
          ))}
        </div>
      </div>
    </div>
  );
}
