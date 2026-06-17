import { useEffect, useMemo, useState } from "react";
import {
  CUSTOM_RESUME_JOB_TITLE_VALUE,
  readCustomResumeJobTitles,
  resumeJobTitleSelectOptions,
  saveCustomResumeJobTitle,
} from "@/lib/resume/jobTitleCatalog";
import { JOB_ROLES } from "@/lib/post/jobListingCatalog";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const BUILT_IN_TITLES = JOB_ROLES.filter((role) => role !== "Other");

export function ResumeJobTitleQuestionField({ value, onChange, placeholder }: Props) {
  const [customTitles, setCustomTitles] = useState<string[]>(() => readCustomResumeJobTitles());

  const catalogValues = useMemo(() => {
    const set = new Set<string>();
    for (const title of BUILT_IN_TITLES) set.add(title.toLowerCase());
    for (const title of customTitles) set.add(title.toLowerCase());
    return set;
  }, [customTitles]);

  const valueIsCustom = Boolean(value && !catalogValues.has(value.toLowerCase()));
  const [usingCustom, setUsingCustom] = useState(valueIsCustom);
  const [customDraft, setCustomDraft] = useState(valueIsCustom ? value : "");

  useEffect(() => {
    if (value && !catalogValues.has(value.toLowerCase())) {
      setUsingCustom(true);
      setCustomDraft(value);
    }
  }, [value, catalogValues]);

  const selectOptions = useMemo(() => {
    const base = resumeJobTitleSelectOptions(customTitles, true).filter(
      (option) => option.value !== "Other"
    );
    return [
      ...base,
      { value: CUSTOM_RESUME_JOB_TITLE_VALUE, label: "Other — type your own…" },
    ];
  }, [customTitles]);

  const selectValue =
    usingCustom || valueIsCustom ? CUSTOM_RESUME_JOB_TITLE_VALUE : value || "";

  function handleSelectChange(next: string) {
    if (next === CUSTOM_RESUME_JOB_TITLE_VALUE) {
      setUsingCustom(true);
      setCustomDraft(valueIsCustom ? value : "");
      onChange("");
      return;
    }

    setUsingCustom(false);
    setCustomDraft("");
    onChange(next);
  }

  function handleCustomChange(text: string) {
    setCustomDraft(text);
    const trimmed = text.trim();
    onChange(trimmed);
    if (trimmed.length >= 2) {
      setCustomTitles(saveCustomResumeJobTitle(trimmed));
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <select
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20"
      >
        {selectOptions.map((option) => (
          <option key={option.value || "placeholder"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {(usingCustom || valueIsCustom) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Your job title
          </label>
          <input
            type="text"
            value={customDraft}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder={placeholder ?? "e.g. Quantum Computing Researcher"}
            autoFocus
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20"
          />
          <p className="mt-2 text-xs text-slate-500">
            Enter the title in your own wording if it is not listed above.
          </p>
        </div>
      )}
    </div>
  );
}
