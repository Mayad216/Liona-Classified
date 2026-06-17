import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  CUSTOM_RESUME_JOB_TITLE_VALUE,
  readCustomResumeJobTitles,
  resumeJobTitleSelectOptions,
  saveCustomResumeJobTitle,
} from "@/lib/resume/jobTitleCatalog";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  customPlaceholder?: string;
};

export function ResumeJobTitleField({
  label = "Job title",
  value,
  onChange,
  customPlaceholder = "e.g. Quantum Computing Researcher",
}: Props) {
  const [customTitles, setCustomTitles] = useState<string[]>(() => readCustomResumeJobTitles());

  const catalogValues = useMemo(() => {
    const values = new Set<string>();
    for (const option of resumeJobTitleSelectOptions(customTitles, false)) {
      if (option.value) values.add(option.value);
    }
    return values;
  }, [customTitles]);

  const valueIsCustom = Boolean(value && !catalogValues.has(value));
  const [usingCustom, setUsingCustom] = useState(valueIsCustom);
  const [customDraft, setCustomDraft] = useState(valueIsCustom ? value : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value && !catalogValues.has(value)) {
      setUsingCustom(true);
      setCustomDraft(value);
    }
  }, [value, catalogValues]);

  const selectOptions = useMemo(
    () => [
      ...resumeJobTitleSelectOptions(customTitles),
      { value: CUSTOM_RESUME_JOB_TITLE_VALUE, label: "Other — type your own…" },
    ],
    [customTitles]
  );

  const selectValue =
    usingCustom && !value
      ? CUSTOM_RESUME_JOB_TITLE_VALUE
      : valueIsCustom
        ? CUSTOM_RESUME_JOB_TITLE_VALUE
        : value;

  function handleSelectChange(next: string) {
    setError(null);
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

  function handleUseCustomTitle() {
    const trimmed = customDraft.trim();
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }

    const saved = saveCustomResumeJobTitle(trimmed);
    setCustomTitles(saved);
    onChange(trimmed);
    setUsingCustom(false);
    setCustomDraft("");
    setError(null);
  }

  return (
    <div className="space-y-2">
      <Select
        label={label}
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        options={selectOptions}
      />

      {(usingCustom || valueIsCustom) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <Input
            label="Custom job title"
            placeholder={customPlaceholder}
            value={customDraft}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              setError(null);
            }}
            hint="Use this if your exact title isn't listed above. It will be saved for your future resume entries."
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUseCustomTitle}
              disabled={customDraft.trim().length < 2}
              className="bg-[#00a67e] hover:bg-[#008f6b]"
            >
              Use this title
            </Button>
            {!usingCustom && valueIsCustom && (
              <span className="text-xs text-slate-500">Current: {value}</span>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
