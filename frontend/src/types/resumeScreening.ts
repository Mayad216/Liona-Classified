export type ResumeScreeningQuestionType =
  | "text"
  | "job_title"
  | "single_choice"
  | "multi_choice"
  | "date";

export type ResumeScreeningSource = "jobcopilot" | "resumebuilder";

export interface ResumeScreeningQuestion {
  id: string;
  label: string;
  help_text?: string;
  type: ResumeScreeningQuestionType;
  options?: string[];
  placeholder?: string;
  required: boolean;
  source: ResumeScreeningSource;
  category: string;
}

export interface ResumeScreeningSourceMeta {
  id: ResumeScreeningSource;
  name: string;
  url: string;
  description: string;
}

export type ResumeScreeningAnswers = Record<string, string | string[]>;

export interface ResumeScreeningCatalog {
  sources: ResumeScreeningSourceMeta[];
  questions: ResumeScreeningQuestion[];
  platform_status?: Record<
    string,
    { reachable: boolean; message: string }
  >;
  fetched_at: string;
  note?: string;
}
