import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export const CUSTOM_JOB_OPTION_VALUE = "__custom__";

type Props = {
  label: string;
  kind: "role" | "industry";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  onSaveCustom: (kind: "role" | "industry", name: string) => Promise<string>;
  customPlaceholder?: string;
};

export function JobListingOptionField({
  label,
  kind,
  value,
  onChange,
  options,
  onSaveCustom,
  customPlaceholder,
}: Props) {
  const catalogValues = useMemo(
    () =>
      new Set(
        options
          .map((option) => option.value)
          .filter((optionValue) => optionValue && optionValue !== CUSTOM_JOB_OPTION_VALUE)
      ),
    [options]
  );

  const valueIsCustom = Boolean(value && !catalogValues.has(value));
  const [usingCustom, setUsingCustom] = useState(valueIsCustom);
  const [customDraft, setCustomDraft] = useState(valueIsCustom ? value : "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value && !catalogValues.has(value)) {
      setUsingCustom(true);
      setCustomDraft(value);
    }
  }, [value, catalogValues]);

  const selectOptions = useMemo(
    () => [
      ...options,
      { value: CUSTOM_JOB_OPTION_VALUE, label: "Other — type your own…" },
    ],
    [options]
  );

  const selectValue = usingCustom && !value ? CUSTOM_JOB_OPTION_VALUE : value;

  function handleSelectChange(next: string) {
    setFeedback(null);
    setError(null);
    if (next === CUSTOM_JOB_OPTION_VALUE) {
      setUsingCustom(true);
      setCustomDraft(valueIsCustom ? value : "");
      onChange("");
      return;
    }
    setUsingCustom(false);
    setCustomDraft("");
    onChange(next);
  }

  async function handleSaveCustom() {
    const trimmed = customDraft.trim();
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }

    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const savedName = await onSaveCustom(kind, trimmed);
      onChange(savedName);
      setUsingCustom(false);
      setCustomDraft("");
      setFeedback("Saved — now available for all future job listings.");
    } catch {
      setError("Could not save right now. Try again.");
    } finally {
      setSaving(false);
    }
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
            label={`Custom ${kind}`}
            placeholder={
              customPlaceholder ??
              (kind === "role"
                ? "e.g. Quantum Computing Researcher"
                : "e.g. Space Technology & Satellites")
            }
            value={customDraft}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              setError(null);
            }}
            hint="This will be saved and suggested to other employers listing jobs."
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSaveCustom()}
              disabled={saving || customDraft.trim().length < 2}
            >
              {saving ? "Saving…" : "Save & use"}
            </Button>
            {!usingCustom && valueIsCustom && (
              <span className="text-xs text-slate-500">Using your custom entry: {value}</span>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {feedback && <p className="mt-2 text-xs text-emerald-700">{feedback}</p>}
        </div>
      )}
    </div>
  );
}
