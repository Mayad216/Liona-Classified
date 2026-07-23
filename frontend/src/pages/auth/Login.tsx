import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { isLiveApi } from "@/lib/apiMode";
import { useAuth } from "@/lib/auth";

function formatAuthError(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      /* plain text body */
    }
    return err.message || "Sign-in failed";
  }
  return "Something went wrong";
}

export function Login() {
  const navigate = useNavigate();
  const { login, demoLogin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [user, navigate]);
  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white">
              <span className="text-lg font-black">K</span>
            </div>
            <span className="text-base font-bold">Khaleej</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            New here?{" "}
            <Link to="/auth/register" className="font-semibold text-brand-700 hover:underline">
              Create an account
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
              const email = String(fd.get("email") ?? "");
              const password = String(fd.get("password") ?? "");
              setLoading(true);
              setError(null);
              void (async () => {
                try {
                  await login(email, password);
                  const stored = localStorage.getItem("khaleej:auth_user");
                  const role = stored
                    ? (JSON.parse(stored) as { role?: string }).role
                    : "seeker";
                  navigate(role === "admin" ? "/admin" : "/dashboard");
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
              type="email"
              name="email"
              label="Email"
              placeholder="you@khaleej.ae"
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required
            />
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>
              <a href="#" className="font-medium text-brand-700 hover:underline">
                Forgot password?
              </a>
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs uppercase tracking-widest text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {isLiveApi() ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Staging accounts (real API · password: password)
                </p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  <li>
                    <strong>admin@khaleej.ae</strong> — admin panel
                  </li>
                  <li>
                    <strong>aisha@khaleej.ae</strong> — lister dashboard
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Demo accounts (password: password)
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      demoLogin("lister");
                      navigate("/dashboard");
                    }}
                  >
                    Lister
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      demoLogin("seeker");
                      navigate("/dashboard");
                    }}
                  >
                    Seeker
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      demoLogin("admin");
                      navigate("/admin");
                    }}
                  >
                    Admin
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 lg:block">
        <div className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <blockquote className="mt-auto max-w-md">
            <p className="text-2xl font-medium leading-relaxed">
              "Khaleej made finding a roommate in Dubai feel safe and effortless. The AI
              match score was uncanny."
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">Aisha Al Marri</div>
                <div className="text-sm text-brand-200">Marketing Lead, Dubai Marina</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
