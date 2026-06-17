export type RemotePreference = "remote" | "hybrid" | "onsite" | "any";

export type CopilotPlanSlug =
  | "free"
  | "premium_starter"
  | "premium_pro"
  | "premium_max";

export interface JobSeekerProfile {
  id?: number;
  user_id?: number;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  country: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  years_of_experience: number | null;
  current_job_title: string | null;
  target_job_titles: string[] | null;
  target_industries: string[] | null;
  preferred_locations: string[] | null;
  remote_preference: RemotePreference;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  work_authorization: string | null;
  requires_visa_sponsorship: boolean;
  notice_period: string | null;
  availability_date: string | null;
  professional_summary: string | null;
  completion?: number;
}

export interface ScreeningQuestion {
  key: string;
  text: string;
  type: string;
}

export interface ScreeningAnswer {
  id?: number;
  question_key: string;
  question_text: string;
  answer_text: string;
  answer_type?: string;
}

export interface CopilotResumeSummary {
  id: string | number;
  title: string;
  template?: string;
  is_default: boolean;
  parse_status: "none" | "pending" | "completed" | "failed";
  ats_score: number | null;
  original_file_name?: string | null;
  file_path?: string | null;
  updated_at?: string;
}

export interface CopilotApplication {
  id: number;
  job_match_id?: number | null;
  application_type: "auto" | "manual";
  status: CopilotApplicationStatus;
  confidence_score?: number | null;
  confidence_breakdown?: Record<
    string,
    { label: string; weight: number; score: number; weighted: number }
  > | null;
  detected_screening?: Array<{
    key: string;
    text: string;
    source: string;
    confidence: number;
  }> | null;
  apply_url?: string | null;
  cover_letter?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
  submitted_at?: string | null;
  created_at: string;
  job?: {
    source: "platform" | "external";
    id: number;
    title: string;
    company: string;
    emirate?: string;
    location?: string;
    employment_type?: string;
  } | null;
  resume?: { id: number | string; title: string } | null;
}

export type CopilotApplicationStatus =
  | "queued"
  | "running"
  | "submitted"
  | "needs_review"
  | "failed"
  | "cancelled";

export interface CopilotAutoApplyConsent {
  has_consent: boolean;
  consent_version: string;
  consent_text: string;
  latest?: {
    consented_at: string;
    ip_address?: string | null;
    revoked_at?: string | null;
  } | null;
}

export interface CopilotAutomationLogEntry {
  id: number;
  step: string;
  level: string;
  message: string;
  payload?: Record<string, unknown> | null;
  screenshot_path?: string | null;
  screenshot_url?: string | null;
  created_at: string;
}

export interface CopilotBlacklistEntry {
  id: number;
  type: "company" | "domain" | "url";
  value: string;
  reason?: string | null;
}

export interface CopilotAutomationSettings {
  daily_digest_enabled: boolean;
  daily_digest_hour: number;
  last_digest_at?: string | null;
}

export interface CopilotDigestPreview {
  submitted: number;
  needs_review: number;
  failed: number;
  auto_used: number;
  remaining: number;
}

export interface CopilotCountry {
  code: string;
  name: string;
  currency: string;
  cities: string[];
}

export interface CopilotAdminMonitoring {
  totals: {
    copilot_jobs: number;
    job_sources: number;
    active_sources: number;
    premium_users: number;
    applications_24h: number;
    matches_total: number;
    embedding_coverage_pct: number;
  };
  jobs_by_country: Record<string, number>;
  ai_usage_today: number;
  recent_scrape_runs: Array<{
    id: number;
    source?: string;
    country?: string;
    status: string;
    jobs_found: number;
    jobs_imported: number;
    jobs_updated: number;
    error_message?: string | null;
    started_at?: string;
    finished_at?: string | null;
  }>;
  sources: Array<Record<string, unknown>>;
}

export interface CopilotDashboard {
  plan: {
    slug: CopilotPlanSlug;
    name: string;
    subscription_status: string;
    is_premium: boolean;
    auto_apply_enabled: boolean;
  };
  profile: {
    completion: number;
    missing_fields: string[];
    record: JobSeekerProfile | null;
  };
  resumes: {
    count: number;
    default: CopilotResumeSummary | null;
    items: CopilotResumeSummary[];
  };
  applications: {
    total: number;
    recent: CopilotApplication[];
  };
  auto_apply?: {
    has_consent: boolean;
    can_auto_apply: boolean;
  };
  next_steps: string[];
  top_matches?: CopilotJobMatchPreview[];
  ai_usage?: CopilotAiUsage;
  usage?: CopilotUsageSummary;
}

export interface CopilotAiUsage {
  ai_credits_used: number;
  ai_credits_limit: number;
  ai_credits_remaining: number;
  month: number;
  year: number;
}

export interface CopilotAutoUsage {
  auto_applications_used: number;
  auto_applications_today: number;
  monthly_limit: number;
  daily_limit: number;
  remaining: number;
  can_auto_apply: boolean;
}

export interface CopilotUsageSummary {
  ai: CopilotAiUsage;
  auto_apply: CopilotAutoUsage;
}

export interface SubscriptionPlanRecord {
  id: number;
  slug: CopilotPlanSlug;
  name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  auto_apply_enabled: boolean;
  monthly_application_limit: number;
  daily_application_limit: number;
  ai_credit_limit: number;
  features?: string[];
}

export interface CreditPack {
  name: string;
  price_aed: number;
  auto_credits: number;
  ai_credits: number;
}

export interface CopilotBillingSummary {
  plan: {
    slug: CopilotPlanSlug;
    name: string;
    subscription_status: string;
    subscription_ends_at: string | null;
    is_premium: boolean;
    auto_apply_enabled: boolean;
    price_monthly: number;
    price_yearly: number;
  };
  usage: CopilotUsageSummary;
  credit_balances: {
    auto_applications: number;
    ai_credits: number;
  };
  stripe_enabled: boolean;
  recent_events: Array<{
    event_type: string;
    plan_slug: string | null;
    amount_aed: number | null;
    created_at: string;
  }>;
}

export interface CopilotTailorResult {
  tailored_summary: string;
  tailored_experience_bullets: Array<{
    experience_index: number;
    bullet_index: number;
    suggested_text: string;
  }>;
  suggested_keywords: string[];
  missing_information: string[];
}

export interface CopilotKeywordResult {
  missing_keywords: string[];
  already_present: string[];
}

export interface CopilotMatchExplanation {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  match_reason: string;
  risks: string[];
  recommendation: string;
}

export interface CopilotJobMatchPreview {
  id: number;
  match_score: number;
  match_reason: string | null;
  title: string;
  company: string;
}

export interface CopilotMatchedJob {
  source: "platform" | "external";
  id: number;
  title: string;
  company: string;
  description?: string;
  emirate?: string;
  area?: string;
  location?: string;
  industry?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  remote?: boolean;
  remote_type?: string;
  country?: string;
  apply_url?: string;
}

export interface CopilotJobMatch {
  id: number;
  match_score: number;
  semantic_score?: number | null;
  scoring_method?: string;
  match_reason: string | null;
  matched_skills: string[];
  missing_skills: string[];
  salary_match: boolean;
  location_match: boolean;
  experience_match: boolean;
  work_authorization_match: boolean;
  recommendation_status: "recommended" | "hidden" | "saved" | "dismissed";
  job: CopilotMatchedJob | null;
}

export const EMPTY_JOB_SEEKER_PROFILE: JobSeekerProfile = {
  full_name: "",
  phone: "",
  location: "",
  country: "UAE",
  linkedin_url: "",
  portfolio_url: "",
  github_url: "",
  years_of_experience: null,
  current_job_title: "",
  target_job_titles: [],
  target_industries: [],
  preferred_locations: [],
  remote_preference: "any",
  expected_salary_min: null,
  expected_salary_max: null,
  currency: "AED",
  work_authorization: "",
  requires_visa_sponsorship: false,
  notice_period: "",
  availability_date: null,
  professional_summary: "",
};
