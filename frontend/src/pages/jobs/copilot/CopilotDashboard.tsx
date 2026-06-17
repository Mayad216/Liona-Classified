import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { useCopilotDashboard } from "@/lib/copilot/useCopilotDashboard";

export function CopilotLanding() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden />
      <section className="container max-w-4xl py-16 text-center">
        <Badge tone="brand">
          <Sparkles className="h-3 w-3" />
          Jobs Copilot
        </Badge>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
          Apply smarter with{" "}
          <span className="gradient-text">AI job matching</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Free users get profile setup, resume parsing, match scores, and manual apply links.
          Premium unlocks auto-apply, cover letters, and application tracking — always using your
          real information, never fabricated credentials.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link to="/jobs/copilot/dashboard">
              <Button size="lg">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth/register">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </>
          )}
          <Link to="/jobs/copilot/pricing">
            <Button variant="outline" size="lg">
              View pricing
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Smart matching",
              text: "Deterministic scoring on title, skills, salary, location, and work authorization.",
            },
            {
              icon: Bot,
              title: "Truthful AI",
              text: "Rewrite and optimize only — never invent experience, degrees, or visas.",
            },
            {
              icon: Zap,
              title: "Auto-apply (Premium)",
              text: "Playwright automation with confidence checks and needs-review workflow.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CopilotDashboardPage() {
  const { data, loading, error } = useCopilotDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        {error ?? "Sign in to view your Jobs Copilot dashboard."}
      </div>
    );
  }

  const completionPct = Math.round(data.profile.completion * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Plan" value={data.plan.name} sub={data.plan.is_premium ? "Premium" : "Free tier"} />
        <StatCard label="Profile" value={`${completionPct}%`} sub="Completion" />
        <StatCard label="Resumes" value={String(data.resumes.count)} sub={data.resumes.default?.title ?? "No default"} />
        <StatCard label="Applications" value={String(data.applications.total)} sub="Submitted" />
        {data.ai_usage && (
          <StatCard
            label="AI credits"
            value={String(data.ai_usage.ai_credits_remaining)}
            sub={`of ${data.ai_usage.ai_credits_limit} this month`}
          />
        )}
      </div>

      {data.next_steps.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Next steps</h2>
          <ul className="mt-3 space-y-2">
            {data.next_steps.map((step) => (
              <li key={step} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/jobs/copilot/profile">
              <Button size="sm">Complete profile</Button>
            </Link>
            <Link to="/jobs/copilot/resumes">
              <Button size="sm" variant="outline">
                Manage resumes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {(data.top_matches?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Top job matches</h2>
            <Link to="/jobs/copilot/jobs" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.top_matches!.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-slate-500">{m.company}</p>
                </div>
                <Badge tone="brand">{Math.round(m.match_score)}%</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Recent applications</h2>
          <Link to="/jobs/copilot/applications" className="text-sm text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {data.applications.recent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No applications yet. Browse jobs to apply.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.applications.recent.map((app) => (
              <li key={app.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{app.job?.title ?? "Job"}</p>
                  <p className="text-slate-500">
                    {app.job?.company}
                    {app.job?.emirate ? ` · ${app.job.emirate}` : ""}
                    {app.job?.location ? ` · ${app.job.location}` : ""}
                  </p>
                </div>
                <Badge tone={app.status === "submitted" ? "success" : app.status === "needs_review" ? "warning" : "default"}>
                  {app.status.replace(/_/g, " ")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.plan.auto_apply_enabled && !data.auto_apply?.has_consent && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <h2 className="font-semibold text-amber-900">Enable auto-apply consent</h2>
          <p className="mt-1 text-sm text-amber-800">
            Grant consent on the Recommended Jobs page to start automated applications.
          </p>
          <Link to="/jobs/copilot/jobs" className="mt-3 inline-block">
            <Button size="sm">Go to jobs</Button>
          </Link>
        </div>
      )}

      {!data.plan.auto_apply_enabled && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
          <h2 className="font-semibold text-brand-900">Upgrade for auto-apply</h2>
          <p className="mt-1 text-sm text-brand-800">
            Premium plans add automated applications, cover letters, screening answers, and
            priority matching.
          </p>
          <Link to="/jobs/copilot/billing" className="mt-3 inline-block">
            <Button size="sm">Manage billing</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
