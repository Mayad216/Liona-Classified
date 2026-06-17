import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StarScoreField } from "@/components/services/StarScoreField";
import { useAuth } from "@/lib/auth";
import {
  buildAuthorLabel,
  COMPANY_REVIEW_DIMENSIONS,
  computeCompanyOverallRating,
  defaultCompanyReviewScores,
} from "@/lib/companyReviews/dimensions";
import type { CompanyReview, CompanyReviewEmploymentStatus } from "@/types/companyReviews";
import type { Emirate } from "@/types";

const EMIRATES: Emirate[] = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

type Props = {
  employerId: string;
  companyName: string;
  jobId?: string;
  defaultJobTitle?: string;
  defaultEmirate?: string;
  hasReviewed: boolean;
  onSubmit: (review: CompanyReview) => void;
};

export function CompanyReviewForm({
  employerId,
  companyName,
  jobId,
  defaultJobTitle = "",
  defaultEmirate = "Dubai",
  hasReviewed,
  onSubmit,
}: Props) {
  const { user } = useAuth();
  const [scores, setScores] = useState(defaultCompanyReviewScores);
  const [employmentStatus, setEmploymentStatus] =
    useState<CompanyReviewEmploymentStatus>("former");
  const [jobTitle, setJobTitle] = useState(defaultJobTitle);
  const [emirate, setEmirate] = useState(defaultEmirate);
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginRedirect = jobId
    ? `/auth/login?redirect=${encodeURIComponent(`/jobs/${jobId}#company-reviews`)}`
    : "/auth/login";

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-sm font-semibold text-slate-900">Sign in to review this employer</p>
        <p className="mt-1 text-sm text-slate-600">
          Share your experience to help other job seekers — reviews are anonymous and one per
          company, similar to Indeed company reviews.
        </p>
        <Link to={loginRedirect} className="mt-4 inline-block">
          <Button size="sm">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (hasReviewed || submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Thanks — your review is published</p>
          <p className="mt-1 text-sm text-emerald-800">
            You can submit one review per company. To update it, contact support — we keep reviews
            fair and professional.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (body.trim().length < 40) {
      setError("Please write at least a few sentences about your experience with this employer.");
      return;
    }

    const review: CompanyReview = {
      id: `user-${user.id}-${Date.now()}`,
      employerId,
      companyName,
      reviewerUserId: String(user.id),
      authorLabel: buildAuthorLabel(employmentStatus, jobTitle, emirate),
      employmentStatus,
      jobTitle: jobTitle.trim() || undefined,
      emirate: emirate.trim() || undefined,
      createdAt: new Date().toISOString(),
      body: body.trim(),
      scores,
      overallRating: computeCompanyOverallRating(scores),
    };

    onSubmit(review);
    setSubmitted(true);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Write a company review</p>
          <p className="mt-1 text-xs text-slate-500">
            Rate {companyName} on professional criteria used by leading job platforms. Your name is
            not shown — only your role, status, and location.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select
          label="Your relationship with this company"
          value={employmentStatus}
          onChange={(e) => setEmploymentStatus(e.target.value as CompanyReviewEmploymentStatus)}
          options={[
            { value: "current", label: "Current employee" },
            { value: "former", label: "Former employee" },
            { value: "applicant", label: "Interview / application only" },
          ]}
        />
        <Select
          label="Location"
          value={emirate}
          onChange={(e) => setEmirate(e.target.value)}
          options={EMIRATES.map((e) => ({ value: e, label: e }))}
        />
        <Input
          label="Job title (optional)"
          placeholder="e.g. Senior Product Designer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>

      <div className="mt-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Rate each area (1–5 stars)
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {COMPANY_REVIEW_DIMENSIONS.map((dim) => (
            <div key={dim.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <StarScoreField
                label={dim.label}
                value={scores[dim.id] ?? 4}
                onChange={(value) => setScores((prev) => ({ ...prev, [dim.id]: value }))}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{dim.prompt}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Your review
        </label>
        <textarea
          rows={5}
          placeholder="What is it like to work here — or to interview here? Mention culture, compensation, growth, management, and hiring. Avoid names of individuals."
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError(null);
          }}
          className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
        <p className="mt-1 text-xs text-slate-500">
          Reviews are moderated for professionalism. Do not include personal contact details.
        </p>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <Button type="submit" className="mt-4" size="sm">
        Submit company review
      </Button>
    </form>
  );
}
