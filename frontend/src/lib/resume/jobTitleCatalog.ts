import { JOB_ROLES, mergeJobListingOptions } from "@/lib/post/jobListingCatalog";

const STORAGE_KEY = "khaleej:resume_custom_job_titles";

export const CUSTOM_RESUME_JOB_TITLE_VALUE = "__custom__";

export function readCustomResumeJobTitles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveCustomResumeJobTitle(title: string): string[] {
  const trimmed = title.trim();
  if (trimmed.length < 2) return readCustomResumeJobTitles();

  const existing = readCustomResumeJobTitles();
  const key = trimmed.toLowerCase();
  if (existing.some((item) => item.toLowerCase() === key)) {
    return existing;
  }

  const next = [...existing, trimmed].sort((a, b) => a.localeCompare(b));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resumeJobTitleSelectOptions(
  customTitles: string[],
  includePlaceholder = true
) {
  return mergeJobListingOptions(
    JOB_ROLES,
    customTitles,
    includePlaceholder,
    "Select a job title…"
  );
}

/** Flat catalog for autocomplete filtering elsewhere in the resume builder. */
export const RESUME_JOB_TITLE_CATALOG = JOB_ROLES;
