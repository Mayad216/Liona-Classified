import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function formatAuthError(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      /* plain text body */
    }
    return err.message || "Registration failed";
  }
  return "Something went wrong";
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 lg:block">
        <div className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-10" />
        <div className="relative flex h-full flex-col p-12 text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Join 150,000+ verified UAE users.
          </h2>
          <p className="mt-3 max-w-md text-brand-100">
            Free forever for personal listings. No hidden fees, ever.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              "Post unlimited listings — pay only when you close a deal",
              "AI-powered match scores for accommodation and jobs",
              "Verified-only inbox: no spam, no fake profiles",
              "Built-in agreement and review system",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white">
              <span className="text-lg font-black">K</span>
            </div>
            <span className="text-base font-bold">Khaleej</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Already have one?{" "}
            <Link to="/auth/login" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") ?? "");
              const email = String(fd.get("email") ?? "");
              const phone = String(fd.get("phone") ?? "");
              const password = String(fd.get("password") ?? "");
              setLoading(true);
              setError(null);
              void (async () => {
                try {
                  await register({ name, email, phone, password });
                  navigate("/match/verify?onboarding=1");
                } catch (err) {
                  setError(formatAuthError(err));
                } finally {
                  setLoading(false);
                }
              })();
            }}
            className="mt-8 space-y-4"
          >
            <Input
              type="text"
              name="name"
              label="Full name"
              placeholder="Aisha Al Marri"
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@khaleej.ae"
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              type="tel"
              name="phone"
              label="Phone (UAE)"
              placeholder="+971 50 123 4567"
              icon={<Phone className="h-4 w-4" />}
              required
            />
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="At least 8 characters"
              icon={<Lock className="h-4 w-4" />}
              required
            />
            <p className="text-xs text-slate-500">
              By signing up you agree to our{" "}
              <a href="#" className="underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              . We'll send a one-time SMS to verify your number.
            </p>
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
