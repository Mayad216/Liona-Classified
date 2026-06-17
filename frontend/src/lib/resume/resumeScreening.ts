import { getApiBaseUrl } from "@/lib/api";
import type {
  ResumeScreeningAnswers,
  ResumeScreeningCatalog,
  ResumeScreeningQuestion,
} from "@/types/resumeScreening";
import type { ResumeData } from "@/types/resume";

const FALLBACK: ResumeScreeningCatalog = {
  sources: [
    {
      id: "resumebuilder",
      name: "ResumeBuilder.com",
      url: "https://app.resumebuilder.com",
      description: "Career level, target role, and resume tailoring intake.",
    },
    {
      id: "jobcopilot",
      name: "JobCopilot",
      url: "https://jobcopilot.com",
      description: "Job search filters, work authorization, and auto-apply preferences.",
    },
  ],
  questions: [
    {
      id: "target_job_title",
      label: "What job title are you targeting?",
      help_text: "Choose from common roles or enter your own title.",
      type: "job_title",
      placeholder: "Your target role",
      required: true,
      source: "resumebuilder",
      category: "career_goal",
    },
    {
      id: "career_level",
      label: "What is your career level?",
      type: "single_choice",
      options: ["Entry level (0–2 years)", "Mid-career (3–7 years)", "Senior (8+ years)"],
      required: true,
      source: "resumebuilder",
      category: "experience",
    },
    {
      id: "preferred_locations",
      label: "Which locations are you open to?",
      type: "multi_choice",
      options: ["Dubai", "Abu Dhabi", "Sharjah", "Remote — UAE based"],
      required: true,
      source: "jobcopilot",
      category: "job_search",
    },
    {
      id: "work_authorization",
      label: "Are you legally authorized to work in the UAE?",
      type: "single_choice",
      options: ["Yes", "No", "Not sure"],
      required: true,
      source: "jobcopilot",
      category: "eligibility",
    },
    {
      id: "notice_period",
      label: "What is your notice period?",
      type: "single_choice",
      options: ["Available immediately", "1 month", "2–3 months"],
      required: true,
      source: "jobcopilot",
      category: "availability",
    },
  ] as ResumeScreeningCatalog["questions"],
  fetched_at: new Date().toISOString(),
  note: "Bundled fallback — start backend for full catalog.",
};

export async function fetchResumeScreeningCatalog(): Promise<ResumeScreeningCatalog> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/resumes/screening-questions`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data: ResumeScreeningCatalog };
    return json.data;
  } catch {
    return FALLBACK;
  }
}

export function groupQuestionsBySource(
  questions: ResumeScreeningQuestion[]
): Record<string, ResumeScreeningQuestion[]> {
  return questions.reduce<Record<string, ResumeScreeningQuestion[]>>((acc, q) => {
    if (!acc[q.source]) acc[q.source] = [];
    acc[q.source].push(q);
    return acc;
  }, {});
}

export function validateScreeningAnswers(
  questions: ResumeScreeningQuestion[],
  answers: ResumeScreeningAnswers
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of questions) {
    const message = validateScreeningQuestion(q, answers);
    if (message) errors[q.id] = message;
  }
  return errors;
}

export function validateScreeningQuestion(
  question: ResumeScreeningQuestion,
  answers: ResumeScreeningAnswers
): string | undefined {
  if (!question.required) return undefined;

  const value = answers[question.id];

  if (question.type === "job_title") {
    if (typeof value !== "string" || value.trim().length < 2) {
      return "Select a job title or enter your own (at least 2 characters).";
    }
    return undefined;
  }

  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return "This question is required.";
  }
  return undefined;
}

export function getSourceMeta(
  sources: ResumeScreeningCatalog["sources"],
  sourceId: string
): ResumeScreeningCatalog["sources"][number] | undefined {
  return sources.find((s) => s.id === sourceId);
}

/** Prefill resume fields from screening answers where possible. */
export function applyScreeningToResumeData(
  data: ResumeData,
  answers: ResumeScreeningAnswers,
  options?: { overwriteExisting?: boolean }
): ResumeData {
  const overwrite = options?.overwriteExisting ?? true;
  const next = { ...data, personal_info: { ...data.personal_info } };

  const locations = answers.preferred_locations;
  if (
    Array.isArray(locations) &&
    locations.length > 0 &&
    (overwrite || !next.personal_info.location)
  ) {
    const uae = locations.find(
      (l) => l.includes("Dubai") || l.includes("Abu Dhabi") || l.includes("Sharjah")
    );
    next.personal_info.location = uae ?? locations[0];
  }

  const targetTitle = answers.target_job_title;
  if (
    typeof targetTitle === "string" &&
    targetTitle.trim() &&
    (overwrite || !next.summary.trim())
  ) {
    const level =
      typeof answers.career_level === "string" ? answers.career_level.toLowerCase() : "";
    const levelPhrase = level.includes("entry")
      ? "motivated professional"
      : level.includes("senior") || level.includes("executive")
        ? "experienced professional"
        : "professional";
    next.summary = `${levelPhrase.charAt(0).toUpperCase()}${levelPhrase.slice(1)} targeting ${targetTitle.trim()} roles in the UAE.`;
  }

  return next;
}

export function getStoredScreeningAnswers(data: ResumeData): ResumeScreeningAnswers {
  const raw = (data as ResumeData & { builder_screening?: ResumeScreeningAnswers }).builder_screening;
  return raw ?? {};
}
