export type JobApplicationMethod = "platform" | "external_email" | "external_url";

export type JobQuestionType = "text" | "single_choice" | "multi_choice" | "date";

export interface JobApplicationQuestionTemplate {
  id: string;
  label: string;
  help_text?: string;
  type: JobQuestionType;
  options?: string[];
  placeholder?: string;
  default_required: boolean;
  source: "indeed" | "linkedin" | "bayt" | "khaleej";
  category: string;
}

/** Question attached to a job listing by the employer. */
export interface JobApplicationQuestion {
  template_id: string;
  label: string;
  type: JobQuestionType;
  required: boolean;
  options?: string[];
  help_text?: string;
  placeholder?: string;
  source?: string;
}

export type JobApplicationAnswers = Record<string, string | string[]>;
