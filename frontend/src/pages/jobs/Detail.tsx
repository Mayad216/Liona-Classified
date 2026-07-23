import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Send,
  Share2,
  Bookmark,
  Wifi,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/JobCard";
import { useJob, useJobs } from "@/lib/catalog/useCatalog";
import { formatPrice, relativeTime } from "@/lib/utils";
import { ApplyWithResumeModal } from "@/components/resume/ApplyWithResumeModal";
import {
  CompanyRatingSummary,
  CompanyReviewsSection,
} from "@/components/business/CompanyReviewsSection";
import { getEmployerProfile } from "@/lib/companyReviews/employers";
import { buildJobDescription, saveTailorContext } from "@/lib/resume/plan";
import { createResume, listResumes } from "@/lib/resume/useResume";

export function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { job, loading, error, live } = useJob(id);
  const { items: allJobs } = useJobs();
  const [applied, setApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [tailoring, setTailoring] = useState(false);

  if (loading) {
    return <div className="container py-20 text-center text-slate-600">Loading job…</div>;
  }

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        {live && error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <Link to="/jobs" className="mt-4 inline-block text-brand-600 underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const similar = allJobs.filter((j) => j.id !== job.id).slice(0, 3);
  const employer = getEmployerProfile(job.employerId);
  const applicationMethod = job.applicationMethod ?? "platform";
  const isPlatformApply = applicationMethod === "platform";
  const externalHref =
    applicationMethod === "external_email"
      ? `mailto:${job.applicationContact ?? ""}`
      : job.applicationContact ?? "#";

  const handleApplyClick = () => {
    if (isPlatformApply) {
      setApplyOpen(true);
      return;
    }
    window.open(externalHref, "_blank", "noopener,noreferrer");
  };

  const applyLabel =
    applicationMethod === "external_email"
      ? "Apply via email"
      : applicationMethod === "external_url"
        ? "Apply on company site"
        : "Apply with resume";

  const handleTailorResume = async () => {
    setTailoring(true);
    try {
      saveTailorContext({
        jobId: job.id,
        title: job.title,
        company: job.company,
        description: buildJobDescription(job),
      });
      const existing = listResumes();
      const resume =
        existing[0] ??
        (await createResume(`${job.title} — ${job.company}`));
      navigate(`/resume/${resume.id}/edit?tailor=1`);
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="bg-slate-50/40 pb-20">
      <div className="container pt-6">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="h-full w-full object-contain p-2"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">
                      <Briefcase className="h-3 w-3" /> {job.employmentType}
                    </Badge>
                    <Badge>{job.experience}</Badge>
                    {job.remote && (
                      <Badge tone="success">
                        <Wifi className="h-3 w-3" /> Remote
                      </Badge>
                    )}
                    {job.featured && (
                      <Badge tone="warning" className="bg-accent-500 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.area}, {job.emirate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {relativeTime(job.postedAt)}
                    </span>
                    {job.startDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Start: {new Date(job.startDate).toLocaleDateString("en-AE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Section title="About the role">
              <p className="text-base leading-relaxed text-slate-700">{job.description}</p>
            </Section>
            <Section title="Responsibilities">
              <ul className="space-y-2.5">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Requirements">
              <ul className="space-y-2.5">
                {job.requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Benefits & perks">
              <div className="grid gap-2 sm:grid-cols-2">
                {job.benefits.map((b) => (
                  <div
                    key={b}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {b}
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Reviews of ${job.company}`}>
              <div id="company-reviews">
                <CompanyReviewsSection job={job} />
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Compensation
              </div>
              {job.salaryMax > 0 ? (
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {formatPrice(job.salaryMin)} – {formatPrice(job.salaryMax)}
                  <span className="text-sm font-medium text-slate-500"> / month</span>
                </div>
              ) : (
                <div className="mt-1 text-2xl font-black text-slate-900">Per-project</div>
              )}
              {!isPlatformApply && (
                <p className="mt-3 text-xs text-slate-500">
                  Applications are handled{" "}
                  {applicationMethod === "external_email" ? "by email" : "on the employer's site"} —
                  not through Khaleej.
                </p>
              )}
              {isPlatformApply && (job.applicationQuestions?.length ?? 0) > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Includes {job.applicationQuestions!.length} screening question
                  {job.applicationQuestions!.length === 1 ? "" : "s"} (visa, experience, etc.).
                </p>
              )}
              <Button
                size="lg"
                className="mt-5 w-full"
                onClick={handleApplyClick}
                disabled={applied && isPlatformApply}
              >
                {applied && isPlatformApply ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Applied
                  </>
                ) : (
                  <>
                    {applicationMethod === "external_email" ? (
                      <Mail className="h-4 w-4" />
                    ) : applicationMethod === "external_url" ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}{" "}
                    {applyLabel}
                  </>
                )}
              </Button>
              {isPlatformApply && (
                <Link
                  to="/resume"
                  className="mt-2 block text-center text-xs text-brand-700 hover:underline"
                >
                  Don't have a resume? Build one free →
                </Link>
              )}
              <Button
                variant="outline"
                size="lg"
                className="mt-3 w-full"
                disabled={tailoring}
                onClick={handleTailorResume}
              >
                <Sparkles className="h-4 w-4" />
                {tailoring ? "Opening builder…" : "Tailor resume to this job"}
              </Button>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-700">
                  <Bookmark className="h-4 w-4" /> Save
                </button>
                <button className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
                About {job.company}
              </div>
              <CompanyRatingSummary job={job} />
              <p className="mt-2 text-sm text-slate-600">
                {employer?.description ??
                  `Building products loved across MENA. We're hiring for ${Math.floor(Math.random() * 30) + 5} more roles.`}
              </p>
              {employer?.openRolesEstimate && (
                <p className="mt-2 text-xs font-medium text-brand-700">
                  ~{employer.openRolesEstimate} open roles on Khaleej
                </p>
              )}
              <a
                href="#company-reviews"
                className="mt-3 block w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Read company reviews
                </Button>
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">Similar roles</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      </div>

      <ApplyWithResumeModal
        job={job}
        open={applyOpen && isPlatformApply}
        onClose={() => setApplyOpen(false)}
        onApplied={() => setApplied(true)}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
