import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  IdCard,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import {
  formatEmiratesId,
  normalizeEmiratesId,
} from "@/lib/matchmaking/emiratesId";
import { useEmiratesIdVerification } from "@/lib/matchmaking/useEmiratesIdVerification";

export function MatchEmiratesIdVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get("onboarding") === "1";
  const returnTo =
    (location.state as { from?: string } | null)?.from ??
    (onboarding ? "/match/profile?onboarding=1" : "/match/seeker");

  const { status, loading, submitting, error, isVerified, submit } =
    useEmiratesIdVerification();

  const [emiratesId, setEmiratesId] = useState("");
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: "/match/verify" }} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/60">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-10">
        <div className="container max-w-lg">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">Emirates ID verified</h1>
            <p className="mt-2 text-sm text-slate-600">
              You&apos;re cleared to use Match Me
              {status?.emiratesIdLast4 ? ` · ending ···${status.emiratesIdLast4}` : ""}.
            </p>
            <Button className="mt-6" onClick={() => navigate(returnTo)}>
              Continue to Match Me
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-xl">
        <Link
          to="/match"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Match Me
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <IdCard className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-700">
                <Sparkles className="h-3.5 w-3.5" />
                Match Me verification
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Verify your Emirates ID
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Match Me is ID-verified only — so you only see real people looking for roommates.
                Your full ID number is never shown to other users.
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              Required before browsing matches or appearing in search
            </li>
            <li className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
              We store only the last 4 digits and a verified timestamp
            </li>
          </ul>

          {(error || localError) && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error || localError}
            </p>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLocalError(null);
              void submit({
                emiratesId,
                fullName,
                dateOfBirth,
              })
                .then(() => navigate(returnTo))
                .catch((err: Error) => setLocalError(err.message));
            }}
          >
            <Input
              label="Emirates ID number"
              name="emirates_id"
              placeholder="784-1995-1234567-1"
              value={emiratesId}
              onChange={(e) => {
                const digits = normalizeEmiratesId(e.target.value).slice(0, 15);
                setEmiratesId(formatEmiratesId(digits));
              }}
              required
              autoComplete="off"
            />
            <Input
              label="Full name (as on ID)"
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Date of birth"
              name="date_of_birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />

            <p className="text-xs text-slate-500">
              Name must match your account name ({user.name}). Birth year must match the year
              encoded in your Emirates ID.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Verifying…" : "Verify & unlock Match Me"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
