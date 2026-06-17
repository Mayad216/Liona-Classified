export type ResumePlan = "free" | "pro";

export const RESUME_PLAN_KEY = "khaleej:resume_plan";
export const RESUME_TAILOR_KEY = "khaleej:resume_tailor_job";
export const JOB_APPLICATIONS_KEY = "khaleej:job_applications";

export type TailorJobContext = {
  jobId: string;
  title: string;
  company: string;
  description: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  resumeId: string | number;
  resumeTitle?: string;
  shareToken?: string;
  coverLetter?: string;
  answers?: Record<string, string | string[]>;
  appliedAt: string;
  status: "submitted" | "viewed" | "shortlisted" | "rejected";
};

export function getResumePlan(): ResumePlan {
  try {
    return (localStorage.getItem(RESUME_PLAN_KEY) as ResumePlan) ?? "free";
  } catch {
    return "free";
  }
}

export function setResumePlan(plan: ResumePlan) {
  localStorage.setItem(RESUME_PLAN_KEY, plan);
}

export function saveTailorContext(ctx: TailorJobContext) {
  sessionStorage.setItem(RESUME_TAILOR_KEY, JSON.stringify(ctx));
}

export function readTailorContext(): TailorJobContext | null {
  try {
    const raw = sessionStorage.getItem(RESUME_TAILOR_KEY);
    return raw ? (JSON.parse(raw) as TailorJobContext) : null;
  } catch {
    return null;
  }
}

export function clearTailorContext() {
  sessionStorage.removeItem(RESUME_TAILOR_KEY);
}

export function listApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(JOB_APPLICATIONS_KEY);
    const items = raw ? (JSON.parse(raw) as JobApplication[]) : [];
    return items.sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function addApplication(app: Omit<JobApplication, "id" | "status">) {
  const items = listApplications();
  items.unshift({
    ...app,
    id: crypto.randomUUID(),
    status: "submitted",
  });
  localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(items));
  return items[0];
}

export function buildJobDescription(job: {
  title: string;
  company: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
}): string {
  const parts = [
    `${job.title} at ${job.company}`,
    job.description,
    job.responsibilities?.length
      ? `Responsibilities:\n${job.responsibilities.map((r) => `- ${r}`).join("\n")}`
      : "",
    job.requirements?.length
      ? `Requirements:\n${job.requirements.map((r) => `- ${r}`).join("\n")}`
      : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}
