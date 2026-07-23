/**
 * Thin, type-safe wrapper around the Laravel REST API.
 * Falls back gracefully to mock data if the API isn't reachable so the
 * SPA is always demoable.
 */
import { getApiBaseUrl } from "@/lib/apiConfig";

export { getApiBaseUrl, loadApiConfig } from "@/lib/apiConfig";

/** Stored by auth flows; RSVP and topic creation send this as Bearer token. */
export const AUTH_TOKEN_KEY = "khaleej:auth_token";

export function getStoredAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export type CommunityTopicRow = {
  id: string;
  title: string;
  replies: number;
  tag: string;
  lastActivity: string;
};

export type CommunityEventRow = {
  id: string;
  title: string;
  date: string;
  spot: string;
  spots: number;
  verifiedOnly?: boolean;
};

type RequestOptions = RequestInit & { token?: string };

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const api = {
  // ---------- Auth ----------
  login: (email: string, password: string) =>
    request<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) =>
    request<{ token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ---------- Listings ----------
  listings: (params?: Record<string, string | number | undefined>) => {
    const query = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return request<{ data: unknown[]; meta: unknown }>(`/listings${query}`);
  },

  listing: (id: string | number) => request<{ data: unknown }>(`/listings/${id}`),

  // ---------- Jobs ----------
  jobs: () => request<{ data: unknown[] }>("/jobs"),
  job: (id: string | number) => request<{ data: unknown }>(`/jobs/${id}`),

  // ---------- Services ----------
  services: () => request<{ data: unknown[] }>("/services"),
  service: (id: string | number) => request<{ data: unknown }>(`/services/${id}`),

  uaeLocations: () =>
    request<{
      data: {
        name: string;
        slug: string;
        dubizzle_city_id: number | null;
        neighborhoods: {
          name: string;
          name_ar: string | null;
          slug: string | null;
          dubizzle_id: number | null;
          propertyfinder_id: number | null;
          source: string;
        }[];
      }[];
    }>("/uae/locations"),

  // ---------- Community ----------
  communityTopics: () => request<{ data: CommunityTopicRow[] }>("/community/topics"),

  communityEvents: () => request<{ data: CommunityEventRow[] }>("/community/events"),

  communityCreateTopic: (payload: { title: string; tag?: string }, token: string) =>
    request<{ data: CommunityTopicRow }>("/community/topics", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  communityRsvp: (eventId: string, token: string) =>
    request<{ message: string; spots: number }>(`/community/events/${eventId}/rsvp`, {
      method: "POST",
      body: JSON.stringify({}),
      token,
    }),

  // ---------- Resumes ----------
  resumes: (token: string) =>
    request<{ data: import("@/types/resume").ResumeRecord[] }>("/resumes", { token }),

  resume: (id: string | number, token: string) =>
    request<{ data: import("@/types/resume").ResumeRecord }>(`/resumes/${id}`, { token }),

  createResume: (
    payload: Partial<import("@/types/resume").ResumeRecord>,
    token?: string,
    guestToken?: string
  ) => {
    if (token) {
      return request<{ data: import("@/types/resume").ResumeRecord }>("/resumes", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      });
    }
    return request<{ data: import("@/types/resume").ResumeRecord; guest_token: string }>(
      "/guest/resumes",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: guestToken ? { "X-Guest-Token": guestToken } : undefined,
      }
    );
  },

  updateResume: (
    id: string | number,
    payload: Partial<import("@/types/resume").ResumeRecord>,
    token?: string,
    guestToken?: string
  ) => {
    const path = token ? `/resumes/${id}` : `/guest/resumes/${id}`;
    return request<{ data: import("@/types/resume").ResumeRecord }>(path, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
      headers: guestToken ? { "X-Guest-Token": guestToken } : undefined,
    });
  },

  deleteResume: (id: string | number, token: string) =>
    request<{ message: string }>(`/resumes/${id}`, { method: "DELETE", token }),

  publishResume: (id: string | number, isPublic: boolean, token: string) =>
    request<{ data: import("@/types/resume").ResumeRecord; share_url: string }>(
      `/resumes/${id}/publish`,
      {
        method: "POST",
        body: JSON.stringify({ is_public: isPublic }),
        token,
      }
    ),

  claimGuestResumes: (guestToken: string, token: string) =>
    request<{ message: string }>("/resumes/claim-guest", {
      method: "POST",
      body: JSON.stringify({ guest_token: guestToken }),
      token,
    }),

  publicResume: (shareToken: string) =>
    request<{ data: import("@/types/resume").ResumeRecord }>(
      `/resumes/share/${shareToken}/json`
    ),

  resumeAiSummary: (
    payload: {
      job_title?: string;
      experience_notes?: string;
      resume_data?: import("@/types/resume").ResumeData;
    },
    token?: string
  ) =>
    request<{ data: { summary: string } }>("/resumes/ai/summary", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiBullet: (
    payload: { bullet: string; job_title?: string },
    token?: string
  ) =>
    request<{ data: { bullet: string } }>("/resumes/ai/bullet", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiAutocomplete: (
    payload: { field: string; query: string },
    token?: string
  ) =>
    request<{ data: { suggestions: string[] } }>("/resumes/ai/autocomplete", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiJobDescriptions: (
    payload: { job_title: string; company?: string },
    token?: string
  ) =>
    request<{
      data: { suggestions: { text: string; recommended: boolean }[] };
    }>("/resumes/ai/job-descriptions", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiSkills: (
    payload: { job_title: string; company?: string; experience_notes?: string },
    token?: string
  ) =>
    request<{
      data: { suggestions: { skill: string; recommended: boolean }[] };
    }>("/resumes/ai/skills", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiTailor: (
    payload: { resume_data: import("@/types/resume").ResumeData; job_description: string },
    token: string
  ) =>
    request<{ data: import("@/lib/resume/ai").TailorResult }>("/resumes/ai/tailor", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  resumeAiKeywords: (
    payload: { resume_data: import("@/types/resume").ResumeData; job_description: string },
    token: string
  ) =>
    request<{ data: { missing_keywords: string[]; already_present: string[] } }>(
      "/resumes/ai/keywords",
      {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      }
    ),

  applyToJob: (
    jobId: string | number,
    payload: {
      resume_share_token?: string;
      cv_url?: string;
      cover_letter?: string;
      answers?: Record<string, string | string[]>;
    },
    token: string
  ) =>
    request<{ data: unknown }>(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  jobApplicationQuestionTemplates: () =>
    request<{ data: import("@/types/jobApplication").JobApplicationQuestionTemplate[] }>(
      "/jobs/application-question-templates"
    ),

  subscribeResumePro: (token: string) =>
    request<{ message: string; plan: string }>("/resumes/subscribe/pro", {
      method: "POST",
      body: JSON.stringify({}),
      token,
    }),

  // ---------- Jobs Copilot ----------
  copilotDashboard: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotDashboard }>("/copilot/dashboard", {
      token,
    }),

  copilotProfile: (token: string) =>
    request<{
      data: {
        profile: import("@/types/copilot").JobSeekerProfile | null;
        screening_answers: import("@/types/copilot").ScreeningAnswer[];
        screening_questions: import("@/types/copilot").ScreeningQuestion[];
      };
    }>("/copilot/profile", { token }),

  updateCopilotProfile: (
    payload: Partial<import("@/types/copilot").JobSeekerProfile> & {
      screening_answers?: import("@/types/copilot").ScreeningAnswer[];
    },
    token: string
  ) =>
    request<{
      data: {
        profile: import("@/types/copilot").JobSeekerProfile;
        missing_fields: string[];
      };
    }>("/copilot/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),

  copilotResumes: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotResumeSummary[] }>("/copilot/resumes", {
      token,
    }),

  uploadCopilotResume: async (file: File, token: string, title?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);

    const res = await fetch(`${getApiBaseUrl()}/copilot/resumes/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, body || res.statusText);
    }

    return (await res.json()) as {
      data: import("@/types/copilot").CopilotResumeSummary;
      message: string;
    };
  },

  parseCopilotResume: (id: string | number, token: string) =>
    request<{ data: import("@/types/copilot").CopilotResumeSummary; message?: string }>(
      `/copilot/resumes/${id}/parse`,
      { method: "POST", token }
    ),

  setDefaultCopilotResume: (id: string | number, token: string) =>
    request<{ data: import("@/types/copilot").CopilotResumeSummary }>(
      `/copilot/resumes/${id}/set-default`,
      { method: "POST", token }
    ),

  copilotApplications: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotApplication[] }>("/copilot/applications", {
      token,
    }),

  copilotPricing: () =>
    request<{ data: { plans: Record<string, unknown>; currency: string } }>("/copilot/pricing"),

  copilotRecommendedJobs: (token: string, status = "recommended", country?: string) =>
    request<{ data: import("@/types/copilot").CopilotJobMatch[] }>(
      `/copilot/jobs/recommended?status=${status}${country ? `&country=${encodeURIComponent(country)}` : ""}`,
      { token }
    ),

  copilotCountries: () =>
    request<{ data: import("@/types/copilot").CopilotCountry[] }>("/copilot/countries"),

  adminCopilotMonitoring: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotAdminMonitoring }>(
      "/admin/copilot/monitoring",
      { token }
    ),

  adminScrapeJobSource: (sourceId: number, token: string, sync = true) =>
    request<{ message: string }>(`/admin/copilot/job-sources/${sourceId}/scrape?sync=${sync ? "1" : "0"}`, {
      method: "POST",
      token,
    }),

  recalculateCopilotMatches: (token: string, sync = true) =>
    request<{ message: string; matches_count?: number }>(
      `/copilot/jobs/matches/recalculate?sync=${sync ? "1" : "0"}`,
      { method: "POST", token }
    ),

  saveCopilotMatch: (matchId: number, token: string) =>
    request<{ data: import("@/types/copilot").CopilotJobMatch }>(
      `/copilot/jobs/matches/${matchId}/save`,
      { method: "POST", token }
    ),

  dismissCopilotMatch: (matchId: number, token: string) =>
    request<{ message: string }>(`/copilot/jobs/matches/${matchId}/dismiss`, {
      method: "POST",
      token,
    }),

  copilotAiUsage: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotAiUsage }>("/copilot/ai/usage", { token }),

  copilotAiGenerateSummary: (
    payload: { target_role?: string },
    token: string
  ) =>
    request<{ data: { summary: string; usage: import("@/types/copilot").CopilotAiUsage } }>(
      "/copilot/ai/generate-summary",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  copilotAiImproveBullet: (
    payload: { bullet: string; role?: string },
    token: string
  ) =>
    request<{ data: { versions: string[]; usage: import("@/types/copilot").CopilotAiUsage } }>(
      "/copilot/ai/improve-bullet",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  copilotAiCoverLetter: (
    payload: { job_match_id: number; job_description?: string },
    token: string
  ) =>
    request<{ data: { cover_letter: string; usage: import("@/types/copilot").CopilotAiUsage } }>(
      "/copilot/ai/generate-cover-letter",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  copilotAiKeywords: (
    payload: { job_match_id: number; job_description?: string },
    token: string
  ) =>
    request<{
      data: import("@/types/copilot").CopilotKeywordResult & {
        usage: import("@/types/copilot").CopilotAiUsage;
      };
    }>("/copilot/ai/extract-job-keywords", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  copilotAiTailor: (
    payload: { job_match_id: number; job_description?: string },
    token: string
  ) =>
    request<{
      data: import("@/types/copilot").CopilotTailorResult & {
        usage: import("@/types/copilot").CopilotAiUsage;
      };
    }>("/copilot/ai/tailor-resume", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  copilotAiExplainMatch: (
    payload: { job_match_id: number; job_description?: string },
    token: string
  ) =>
    request<{
      data: import("@/types/copilot").CopilotMatchExplanation & {
        usage: import("@/types/copilot").CopilotAiUsage;
      };
    }>("/copilot/ai/explain-match", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  copilotAiScreeningAnswer: (payload: { question: string }, token: string) =>
    request<{
      data: {
        answer: string;
        needs_user_review: boolean;
        usage: import("@/types/copilot").CopilotAiUsage;
      };
    }>("/copilot/ai/generate-screening-answer", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  copilotBilling: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotBillingSummary }>("/copilot/billing", {
      token,
    }),

  copilotBillingPlans: () =>
    request<{
      data: {
        plans: import("@/types/copilot").SubscriptionPlanRecord[];
        credit_packs: Record<string, import("@/types/copilot").CreditPack>;
        currency: string;
        stripe_enabled: boolean;
      };
    }>("/copilot/billing/plans"),

  copilotCheckout: (
    payload: { plan_slug: string; interval?: "monthly" | "yearly" },
    token: string
  ) =>
    request<{
      data: { mode: string; url?: string; activated?: boolean; plan?: string; message?: string };
    }>("/copilot/billing/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  copilotCreditPack: (payload: { pack_slug: string }, token: string) =>
    request<{ data: { mode: string; url?: string; activated?: boolean; message?: string } }>(
      "/copilot/billing/credit-pack",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  copilotCancelSubscription: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotBillingSummary; message: string }>(
      "/copilot/billing/cancel",
      { method: "POST", token }
    ),

  copilotResumeSubscription: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotBillingSummary; message: string }>(
      "/copilot/billing/resume",
      { method: "POST", token }
    ),

  copilotAutoApplyConsent: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotAutoApplyConsent }>(
      "/copilot/auto-apply/consent",
      { token }
    ),

  copilotGrantAutoApplyConsent: (token: string) =>
    request<{ message: string; data: { consented_at: string; consent_version: string } }>(
      "/copilot/auto-apply/consent",
      { method: "POST", body: JSON.stringify({ accepted: true }), token }
    ),

  copilotRevokeAutoApplyConsent: (token: string) =>
    request<{ message: string }>("/copilot/auto-apply/consent", {
      method: "DELETE",
      token,
    }),

  copilotQueueAutoApply: (matchId: number, token: string) =>
    request<{
      message: string;
      data: import("@/types/copilot").CopilotApplication;
    }>(`/copilot/jobs/matches/${matchId}/auto-apply`, {
      method: "POST",
      token,
    }),

  copilotAutoApplications: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotApplication[] }>(
      "/copilot/auto-apply/applications",
      { token }
    ),

  copilotAutoApplicationLogs: (applicationId: number, token: string) =>
    request<{ data: import("@/types/copilot").CopilotAutomationLogEntry[] }>(
      `/copilot/auto-apply/applications/${applicationId}/logs`,
      { token }
    ),

  copilotApproveApplication: (applicationId: number, token: string) =>
    request<{ message: string; data: import("@/types/copilot").CopilotApplication }>(
      `/copilot/auto-apply/applications/${applicationId}/approve`,
      { method: "POST", token }
    ),

  copilotCancelApplication: (applicationId: number, token: string) =>
    request<{ message: string; data: import("@/types/copilot").CopilotApplication }>(
      `/copilot/auto-apply/applications/${applicationId}/cancel`,
      { method: "POST", token }
    ),

  copilotAutomationSettings: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotAutomationSettings }>(
      "/copilot/automation/settings",
      { token }
    ),

  copilotUpdateAutomationSettings: (
    payload: Partial<import("@/types/copilot").CopilotAutomationSettings>,
    token: string
  ) =>
    request<{ message: string; data: import("@/types/copilot").CopilotAutomationSettings }>(
      "/copilot/automation/settings",
      { method: "PUT", body: JSON.stringify(payload), token }
    ),

  copilotDigestPreview: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotDigestPreview }>(
      "/copilot/automation/digest/preview",
      { token }
    ),

  copilotBlacklist: (token: string) =>
    request<{ data: import("@/types/copilot").CopilotBlacklistEntry[] }>(
      "/copilot/automation/blacklist",
      { token }
    ),

  copilotAddBlacklist: (
    payload: { type: string; value: string; reason?: string },
    token: string
  ) =>
    request<{ message: string; data: import("@/types/copilot").CopilotBlacklistEntry }>(
      "/copilot/automation/blacklist",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  copilotRemoveBlacklist: (entryId: number, token: string) =>
    request<{ message: string }>(`/copilot/automation/blacklist/${entryId}`, {
      method: "DELETE",
      token,
    }),

  // ---------- Roommate matchmaking ----------
  roommateProfile: (token: string) =>
    request<{ data: import("@/lib/matchmaking/profileApi").ApiRoommateProfileRow | null }>(
      "/me/roommate-profile",
      { token }
    ),

  upsertRoommateProfile: (
    payload: Record<string, unknown>,
    token: string
  ) =>
    request<{ data: import("@/lib/matchmaking/profileApi").ApiRoommateProfileRow }>(
      "/me/roommate-profile",
      { method: "POST", body: JSON.stringify(payload), token }
    ),

  roommateMatches: (token: string, params?: { min_score?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.min_score != null) qs.set("min_score", String(params.min_score));
    if (params?.limit != null) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request<{ data: unknown[] }>(
      `/roommate-matches${query ? `?${query}` : ""}`,
      { token }
    );
  },

  roommateMatchPair: (userId: string, token: string) =>
    request<{ data: unknown }>(`/roommate-matches/${userId}`, { token }),

  emiratesIdVerification: (token: string) =>
    request<{
      data: {
        status: "none" | "pending" | "verified" | "rejected";
        verified: boolean;
        verified_at?: string | null;
        emirates_id_last4?: string | null;
        is_verified: boolean;
      };
    }>("/me/emirates-id-verification", { token }),

  submitEmiratesIdVerification: (
    payload: { emirates_id: string; full_name: string; date_of_birth: string },
    token: string
  ) =>
    request<{
      data: {
        status: "none" | "pending" | "verified" | "rejected";
        verified: boolean;
        verified_at?: string | null;
        emirates_id_last4?: string | null;
        is_verified: boolean;
      };
      message?: string;
    }>("/me/emirates-id-verification", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  notifications: (token: string) =>
    request<{ data: import("@/lib/notifications/types").AppNotification[] }>(
      "/me/notifications",
      { token }
    ),

  markAllNotificationsRead: (token: string) =>
    request<{ message: string }>("/me/notifications/mark-all-read", {
      method: "POST",
      body: JSON.stringify({}),
      token,
    }),

  dismissNotification: (id: string, token: string) =>
    request<{ message: string }>(`/me/notifications/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    }),

  jobListingSuggestions: (
    payload: {
      role: string;
      industry: string;
      employment_type?: string;
      experience_level?: string;
      work_arrangement?: string;
      company?: string;
    },
    token: string
  ) =>
    request<{
      data: {
        description: string;
        responsibilities: string[];
        qualifications: string[];
        benefits: string[];
        salaryMin?: number | null;
        salaryMax?: number | null;
        experience?: string | null;
      };
    }>("/jobs/ai/listing-suggestions", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  jobListingOptions: () =>
    request<{ data: { roles: string[]; industries: string[] } }>("/jobs/listing-options"),

  businessProfile: (token: string) =>
    request<{ data: import("@/types/businessProfile").BusinessProfile | null }>(
      "/me/business-profile",
      { token }
    ),

  upsertBusinessProfile: (
    payload: import("@/types/businessProfile").BusinessProfileInput,
    token: string
  ) =>
    request<{ data: import("@/types/businessProfile").BusinessProfile }>(
      "/me/business-profile",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      }
    ),

  createJobListingOption: (
    payload: { kind: "role" | "industry"; name: string },
    token?: string
  ) =>
    request<{
      data: { kind: string; name: string; usage_count?: number };
      message?: string;
    }>("/jobs/listing-options", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  serviceListingDescription: (
    payload: {
      category: string;
      title: string;
      emirate: string;
      area: string;
      account_type?: string;
      provider_name?: string;
      price_from?: number;
      unit?: string;
      response_time?: string;
      years_experience?: string;
      coverage?: string;
      same_day?: string;
      trade_licence?: string;
      tutoring_languages?: string[];
      teaches_levels?: string[];
      session_format?: string;
      meal_cuisines?: string[];
      dietary_tags?: string[];
      meal_offering_type?: string;
      meal_fulfillment?: string;
      pest_types?: string[];
    },
    token: string
  ) =>
    request<{ data: { description: string } }>("/services/ai/listing-description", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
};
